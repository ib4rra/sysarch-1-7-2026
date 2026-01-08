import db from '../config/db.js';

export const getOverview = async (req, res) => {
  try {
    // Total registered (active)
    const [totalRows] = await db.query(
      `SELECT COUNT(*) as total FROM Nangka_PWD_user WHERE is_active = 1`
    );

    const totalRegistered = totalRows[0].total || 0;

    // Pending applications (PWD_MIS table)
    const [pendingRows] = await db.query(
      `SELECT COUNT(*) as pending FROM PWD_MIS WHERE registration_status = 'pending'`
    );
    const pendingApplications = pendingRows[0].pending || 0;

    // ID renewals due - registered more than 365 days ago (approximation)
    const [renewalsRows] = await db.query(
      `SELECT COUNT(*) as renewals_due FROM Nangka_PWD_user WHERE registration_date <= DATE_SUB(CURDATE(), INTERVAL 365 DAY)`
    );
    const renewalsDue = renewalsRows[0].renewals_due || 0;

    // Seniors (age >= 60)
    const [seniorsRows] = await db.query(
      `SELECT COUNT(*) as seniors FROM Nangka_PWD_user WHERE age >= 60`
    );
    const seniors = seniorsRows[0].seniors || 0;

    // Gender distribution
    const [genderRows] = await db.query(
      `SELECT sex as gender, COUNT(*) as count FROM Nangka_PWD_user GROUP BY sex`);

    const genderDistribution = genderRows.map(r => ({ gender: r.gender, count: r.count }));

    // Population by cluster group
    const [clusterRows] = await db.query(
      `SELECT IFNULL(cluster_group_no, 1) as cluster, COUNT(*) as count
       FROM Nangka_PWD_user
       GROUP BY cluster
       ORDER BY cluster`);

    const clusterGroups = clusterRows.map(r => ({ cluster: r.cluster, count: r.count }));

    // Disability classifications (count by disability_name)
    const [disabilityRows] = await db.query(
      `SELECT dt.disability_name, COUNT(*) as count
       FROM pwd_disabilities pd
       JOIN disability_types dt ON pd.disability_id = dt.disability_id
       GROUP BY dt.disability_name`);

    const disabilities = disabilityRows.map(r => ({ label: r.disability_name, count: r.count }));

    res.json({
      success: true,
      data: {
        totalRegistered,
        pendingApplications,
        renewalsDue,
        seniors,
        genderDistribution,
        disabilities,
        clusterGroups,
      },
    });
  } catch (err) {
    console.error('Analytics error', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch analytics' });
  }
};

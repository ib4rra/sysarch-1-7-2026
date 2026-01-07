/**
 * Template Controller
 * Copy this file and customize for your needs
 */

export const getAll = async (req, res) => {
  try {
    // TODO: Implement logic to fetch all items
    const items = [];

    res.json({
      success: true,
      message: 'Items fetched successfully',
      data: items,
    });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch items',
    });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement logic to fetch single item by ID
    const item = null;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.json({
      success: true,
      message: 'Item fetched successfully',
      data: item,
    });
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch item',
    });
  }
};

export const create = async (req, res) => {
  try {
    const data = req.body;

    // TODO: Implement logic to create new item
    const newItem = { id: 1, ...data };

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: newItem,
    });
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create item',
    });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // TODO: Implement logic to update item

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { id, ...data },
    });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update item',
    });
  }
};

export const delete_ = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement logic to delete item

    res.json({
      success: true,
      message: 'Item deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete item',
    });
  }
};

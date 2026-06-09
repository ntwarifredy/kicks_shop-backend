const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    await Notification.create({
      type: 'contact_message',
      title: `New Contact Message from ${name}`,
      message: `Subject: ${subject} - ${message.slice(0, 100)}`,
      link: '/admin/notifications',
      refId: contactMessage._id,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

const markMessageRead = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { returnDocument: 'after' }
    );
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }
    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContactMessages,
  markMessageRead,
};

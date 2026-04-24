const User = require("../models/User");

async function updateProfile(req, res, next) {
  try {
    const allowedFields = ["name", "email", "phone", "location", "bio", "avatar"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.email) {
      updates.email = String(updates.email).toLowerCase().trim();
      const existingUser = await User.findOne({ email: updates.email, id: { $ne: req.user.id } });
      if (existingUser) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
    }

    const user = await User.findOneAndUpdate({ id: req.user.id }, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Current and new password are required" });
      return;
    }

    const user = await User.findOne({ id: req.user.id }).select("+password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const valid = await user.matchPassword(currentPassword);
    if (!valid) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.settings = {
      ...user.settings,
      ...(req.body || {}),
      notifications: {
        ...(user.settings?.notifications || {}),
        ...(req.body?.notifications || {}),
      },
      privacy: {
        ...(user.settings?.privacy || {}),
        ...(req.body?.privacy || {}),
      },
      appearance: {
        ...(user.settings?.appearance || {}),
        ...(req.body?.appearance || {}),
      },
    };

    await user.save();
    res.json(user.settings);
  } catch (err) {
    next(err);
  }
}

async function requestUserData(req, res, next) {
  try {
    const { type } = req.body;

    if (!["export", "delete"].includes(type)) {
      res.status(400).json({ message: "type must be 'export' or 'delete'" });
      return;
    }

    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.notifications.unshift({
      id: `n${Date.now()}`,
      type: "system",
      message:
        type === "export"
          ? "Data export request submitted"
          : "Account deletion request submitted",
      time: "Just now",
      read: false,
      createdAt: new Date(),
    });

    await user.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

async function enableTwoFactor(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.settings = {
      ...user.settings,
      security: {
        ...(user.settings?.security || {}),
        twoFactorEnabled: true,
      },
    };
    await user.save();

    res.json({ success: true, twoFactorEnabled: true });
  } catch (err) {
    next(err);
  }
}

async function revokeSession(_req, res) {
  res.json({ success: true });
}

async function deleteMyAccount(req, res, next) {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await user.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateProfile,
  updatePassword,
  updateSettings,
  requestUserData,
  enableTwoFactor,
  revokeSession,
  deleteMyAccount,
};


const Member = require('../models/Member');

async function createMember(req, res) {
  try {
    const { name, position, team } = req.body;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : undefined;
    const normalizedTeam = (team || 'men').toString().trim().toLowerCase() === 'women' ? 'women' : 'men';
    if (!name || !position) {
      return res.status(400).json({ message: 'Name and position are required' });
    }
    const member = await Member.create({ name, position, photoUrl, team: normalizedTeam });
    return res.status(201).json(member);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create member' });
  }
}

async function listMembers(_req, res) {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    return res.json(members);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch members' });
  }
}

async function deleteMember(req, res) {
  try {
    const { id } = req.params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    return res.json({ message: 'Member deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete member' });
  }
}

module.exports = { createMember, listMembers, deleteMember };



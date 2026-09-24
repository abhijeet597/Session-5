const express = require('express');
const router = express.Router();
const { listGroups, createGroup, getGroup, deleteGroup, addMember, removeMember, getAtRisk, acceptInvite, rejectInvite } = require('../controllers/groupController');

router.get('/', listGroups);
router.post('/', createGroup);
router.get('/:id', getGroup);
router.delete('/:id', deleteGroup);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.get('/:id/at-risk', getAtRisk);
router.post('/invites/:inviteId/accept', acceptInvite);
router.post('/invites/:inviteId/reject', rejectInvite);

module.exports = router;

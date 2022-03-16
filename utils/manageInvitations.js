const invitations = [];

module.exports = {
  createNewInvitation: (roomId, invitingUser, invitedUser) => {
    invitations.push({ roomId, invitingUser, invitedUser });
  },
  invitationExist: (roomId) => {
    return invitations.findIndex((invite) => invite.roomId === roomId) !== -1;
  },
  removeInvitation: (roomId) => {
    const invIdx = invitations.findIndex((inv) => inv.roomId === roomId);
    invitations.splice(invIdx, 1);
  },
};

const invitations = [];

module.exports = {
  createNewInvitation: (roomId) => {
    invitations.push({ roomId });
  },
  invitationExist: (roomId) => {
    return invitations.findIndex((invite) => invite.roomId === roomId) !== -1;
  },
};

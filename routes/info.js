function info(req, res) {
    console.log(req.user.id);
    console.log(req.user.username);
    console.log(req.user.avatar);
    console.log(req.user.discriminator);
    console.log(inTeamServer(req.user.guilds));
    res.json(req.user);
}

module.exports = { info };
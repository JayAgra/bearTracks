function denied(req, res, dirname) {
    try {
        res.sendFile("src/denied.html", { root: dirname });
    } catch (error) {
        // you got denied so hard that you were denied being denied
        res.write("Access Denied!" + "\nCould not render 404 page!");
    }
}

module.exports = { denied };
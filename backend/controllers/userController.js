class UserController {
    static async createUserProfile(Service, req, res) {
        try {
                    console.log("Inside UserController.createUserProfile - Received arguments:");

        console.log("Service:", Service); // Should be WebUserService

        console.log("Req object:", req);   // Should be the Express request object

        console.log("Res object:", res);   // Should be the Express response object

            // Corrected line: Destructure username directly from req.body
            const { username } = req.body;
            // Or: const username = req.body.username;
            const uid = req.user.uid;
            const email = req.user.email;
            // You might want to add validation here, e.g., ensure username is not empty
            if (!username) {
                return res.status(400).send("Username is required.");
            }
            const newUserProfile = await Service.createUserProfile(uid, username, email);
            res.status(201).json(newUserProfile);
        } catch (e) {
            console.error(e.message);
            console.trace(); // Keep this for now, it's helpful
            // Use res.status for consistency, as per your original structure
            return res.status(500).send(e.message);
        }
    }


    static async getUserProfile(Service, req, res) {
        try {
            const userProfile = await Service.getUserProfile(req.user.uid);
            if (userProfile) res.status(200).json(userProfile);
            else res.status(404).send("User Profile not found.");
        } catch (e) {
            console.error(e.message);
            if (res.status) return res.status(500).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async updateUserProfile(Service, req, res) {
        try {
            const { username } = req.body.username
            const uid = req.user.uid;
            const email = req.user.email;

            const profileDataUpdate = await Service.updateUserProfile(uid, username, email);
            res.status(200).json(profileDataUpdate);
        } catch (e) {
            console.error(e.message);
            if (res.status) return res.status(500).send(e.message);
            else return res.status(500).send(e.message);
        }
    }

    static async deleteUserProfile(Service, req, res) {
        try {
            if (await Service.deleteUserProfile(req.user.uid)) res.status(204).send("User profile successfully deleted.")
            else res.status(404).send("User Profile not found.");
        } catch (e) {
            console.error(e.message);
            if (res.status) return res.status(500).send(e.message);
            else return res.status(500).send(e.message);
        }
    }
}

export default UserController;
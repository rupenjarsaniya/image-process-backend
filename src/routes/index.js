const { Router } = require("express");
const ImageRoutes = require("./image.route");

const router = Router();

const defaultRoutes = [
    {
        path: "/image",
        route: ImageRoutes,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;

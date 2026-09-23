import { body, validationResult } from "express-validator";

const validateUuid = (field, label) => body(field)
    .isUUID()
    .withMessage(`${label} must be a valid UUID`);

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "fail",
            errors: errors.array()
        });
    }

    next();
};

//////////////////////////////////////// user validators /////////////////////////////////
export const createUserValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ max: 100 })
        .withMessage("Name must be 100 characters or fewer"),

    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ max: 50 })
        .withMessage("Username must be 50 characters or fewer"),

    body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min : 8 })
        .withMessage("Password must be at least 8 characters")
];

export const updateUserValidator = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),

    body("username")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Username cannot be empty"),

    body("email")
        .optional()
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .optional()
        .trim()
        .isLength({ min : 8 })
        .withMessage("Password must be at least 8 characters")
];

export const loginValidator = [
    body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min : 8 })
        .withMessage("Password must be at least 8 characters")
];

//////////////////////////////////// project validators /////////////////////////////////
export const createProjectValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

];

export const updateProjectValidator = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),

    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty"),

];

//////////////////////////// Task Validators ///////////////////////
export const createTaskValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

    body("priority")
        .isIn(["LOW", "MEDIUM", "HIGH"])
        .withMessage("Priority must be LOW, MEDIUM, or HIGH"),

    body("status")
        .isIn(["TODO", "IN_PROGRESS", "DONE"])
        .withMessage("Status must be TODO, IN_PROGRESS, or DONE"),
        
    validateUuid("assignedTo", "Assigned member ID")
        .notEmpty()
        .withMessage("Assigned member ID is required"),

    validateUuid("projectId", "Project ID")
        .notEmpty()
        .withMessage("Project ID is required")
];

export const updateTaskValidator = [
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty"),

    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty"),

    body("priority")
        .optional()
        .isIn(["LOW", "MEDIUM", "HIGH"])
        .withMessage("Priority must be LOW, MEDIUM, or HIGH"),

    body("status")
        .optional()
        .isIn(["TODO", "IN_PROGRESS", "DONE"])
        .withMessage("Status must be TODO, IN_PROGRESS, or DONE"),

    body("assignedTo")
        .optional()
        .isUUID()
        .withMessage("Assigned member ID must be a valid UUID"),

    body("projectId")
        .optional()
        .isUUID()
        .withMessage("Project ID must be a valid UUID")
];

export const updateTaskStatusValidator = [
    body("status")
        .isIn(["TODO", "IN_PROGRESS", "DONE"])
        .withMessage("Status must be TODO, IN_PROGRESS, or DONE")
];
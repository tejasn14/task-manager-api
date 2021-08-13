"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const task_1 = __importDefault(require("../models/task"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post("/tasks", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const task = new task_1.default(Object.assign(Object.assign({}, req.body), { owner: req.user._id }));
    try {
        yield task.save();
        res.status(201).send(task);
    }
    catch (e) {
        res.status(400).send(e);
    }
}));
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:asc
router.get("/tasks", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // alernative: const tasks = await Task.find({ owner: req.user._id })
        const match = {};
        if (req.query.completed) {
            match.completed = req.query.completed === "true";
        }
        const sort = {};
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
        }
        req.query.completed;
        yield req.user
            .populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            },
        })
            .execPopulate();
        res.send(req.user.tasks);
    }
    catch (e) {
        res.status(500).send();
    }
}));
router.get("/tasks/:id", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _id = req.params.id;
    try {
        const task = yield task_1.default.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    }
    catch (e) {
        res.status(500).send();
    }
}));
router.patch("/tasks/:id", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates!" });
    }
    try {
        const task = yield task_1.default.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(404).send();
        }
        updates.forEach((update) => (task[update] = req.body[update]));
        yield task.save();
        res.send(task);
    }
    catch (e) {
        res.status(400).send(e);
    }
}));
router.delete("/tasks/:id", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield task_1.default.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!task) {
            res.status(404).send();
        }
        res.send(task);
    }
    catch (e) {
        res.status(500).send();
    }
}));
module.exports = router;

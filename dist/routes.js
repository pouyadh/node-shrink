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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("./db"));
const router = (0, express_1.Router)();
router.get('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM lists');
        res.json(rows);
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.post('/list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        yield db_1.default.execute('INSERT INTO lists (name, created_at) VALUES (?, ?)', [
            name,
            Date.now(),
        ]);
        res.status(200).json({ message: 'List created successfully' });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Failed to create list' });
    }
}));
router.get('/list/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listId = req.params.id;
        const [rows] = yield db_1.default.query('SELECT * FROM urls WHERE list_id=?', [
            listId,
        ]);
        res.status(200).json({ rows });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.delete('/list/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listId = req.params.id;
        yield db_1.default.execute('DELETE FROM lists WHERE id=?', [listId]);
        res.status(201);
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.post('/list/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listId = req.params.id;
    const { url, urls } = yield req.body;
    if (url) {
        const [result] = yield db_1.default.execute('INSERT INTO urls (list_id,original_url,short_url,created_at) VALUES (?,?,?,?)', [listId, url, '', Date.now()]);
        res.status(201).json({
            message: `Item successfully created. the id is ${result.insertId}`,
        });
    }
    else if (urls) {
        const placeholders = urls.map(() => '(?,?,?,?)').join(', ');
        const created_at = Date.now();
        const values = urls.flatMap((url) => [listId, url, '', created_at]);
        const [result] = yield db_1.default.execute(`INSERT INTO urls (list_id,original_url,short_url,created_at) VALUES ${placeholders}`, values);
        const newLinks = Array.from({ length: result.affectedRows }, (_, i) => result.insertId + i).map((id) => `${process.env.BASE_URL}/api/url/${id}`);
        res
            .status(201)
            .json({ message: `${result.affectedRows} urls created.`, newLinks });
    }
}));
router.get('/url/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urlId = req.params.id;
        const [rows] = yield db_1.default.execute('SELECT original_url FROM urls WHERE id=?', [urlId]);
        res.redirect(rows[0].original_url);
    }
    catch (error) {
        console.log('Database error url/urlId[GET]', error);
        res.status(500).json({ error: 'Failed to fetch url' });
    }
}));
exports.default = router;

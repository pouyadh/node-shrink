import { Router, Request, Response } from 'express';
import db from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const router = Router();

router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lists');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/list', async (req, res) => {
  try {
    const { name } = req.body;
    await db.execute('INSERT INTO lists (name, created_at) VALUES (?, ?)', [
      name,
      Date.now(),
    ]);
    res.status(200).json({ message: 'List created successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Failed to create list' });
  }
});

router.get('/list/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    const [rows] = await db.query('SELECT * FROM urls WHERE list_id=?', [
      listId,
    ]);
    res.status(200).json({ rows });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/list/:id', async (req, res) => {
  try {
    const listId = req.params.id;
    await db.execute('DELETE FROM lists WHERE id=?', [listId]);
    res.status(201);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/url/:id', async (req, res) => {
  try {
    const urlId = req.params.id;
    await db.execute('DELETE FROM urls WHERE id=?', [urlId]);
    res.status(201);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/list/:id', async (req, res) => {
  const listId = req.params.id;
  const { url, urls } = await req.body;

  if (url) {
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO urls (list_id,original_url,short_url,created_at) VALUES (?,?,?,?)',
      [listId, url, '', Date.now()]
    );

    res.status(201).json({
      message: `Item successfully created. the id is ${result.insertId}`,
      newLink: `${process.env.BASE_URL}/api/url/${result.insertId}`,
    });
  } else if (urls) {
    const placeholders = urls.map(() => '(?,?,?,?)').join(', ');
    const created_at = Date.now();
    const values = urls.flatMap((url: string) => [listId, url, '', created_at]);
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO urls (list_id,original_url,short_url,created_at) VALUES ${placeholders}`,
      values
    );
    const newLinks = Array.from(
      { length: result.affectedRows },
      (_, i) => result.insertId + i
    ).map((id) => `${process.env.BASE_URL}/api/url/${id}`);
    res
      .status(201)
      .json({ message: `${result.affectedRows} urls created.`, newLinks });
  }
});

router.get('/url/:id', async (req, res) => {
  try {
    const urlId = req.params.id;
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT original_url FROM urls WHERE id=?',
      [urlId]
    );
    res.redirect(rows[0].original_url);
  } catch (error) {
    console.log('Database error url/urlId[GET]', error);
    res.status(500).json({ error: 'Failed to fetch url' });
  }
});

export default router;

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // Adicione esta linha
app.use(express.urlencoded({ extended: false })); // Adicione esta linha

app.use(express.static('public'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'WoSupport'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

app.get('/index', function (req, res) {
  res.sendFile('/telaprincipal.html')
});
// ROTA POST para processar o login
app.post('/login',function (req, res) {

  const email = req.body.email;
  const senha = req.body.senha;

  if (!email || !senha) {
    return res.status(400).send('Preencha todos os campos');
  }
  
  const sql = 'SELECT * FROM cadastro WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro no login');
    }
    if (results.length > 0) {
      // Usuário encontrado, redireciona para a tela principal
      res.sendFile(__dirname + '/telaprincipal.html');
    } else {
      // Usuário não encontrado
      res.send('Email ou senha incorretos');
    }
  });
});

// ...suas outras rotas (cadastro, cadastroempresa, etc)...
// ...existing code...

// Rota para a página inicial
app.get('/cadastro', (req, res) => {
  res.sendFile(__dirname + '/cadastro.html');
});

// Rota para cadastrar usuário
app.post('/cadastrar', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  const insert = 'INSERT INTO cadastro (nome, email, senha) VALUES (?, ?, ?)';
  db.query(insert, [nome, email, senha], (err, result) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro no cadastro' });
    }});
  });


// Rota para a página inicial
app.get('/cadastrarempresa', (req, res) => {
  res.redirect('/cadastroempresa');
});

// Rota para cadastrar empresa
app.post('/cadastroempresa', (req, res) => {
  const nomeempresa = req.body.nomeempresa;
  const cnpjempresa = req.body.cnpjempresa;
  const descricaoempresa = req.body.descricaoempresa;

  if (!nomeempresa || !cnpjempresa || !descricaoempresa) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  // Use os nomes exatos das colunas do seu banco!
  const insert = 'INSERT INTO cadastroempresa (nome, cnpj, descricao) VALUES (?, ?, ?)';
  db.query(insert, [nomeempresa, cnpjempresa, descricaoempresa], (err, result) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'CNPJ já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro no cadastro' });
    }
    res.redirect('/telaprincipal'); // ou para onde desejar
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta http://localhost:3000');
});
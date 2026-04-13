// ============================================================
// SCRIPT PARA POPULAR O BANCO COM DADOS DE TESTE
// ============================================================

require('dotenv').config();
const pool = require('./src/config/database');

const produtosExemplo = [
  {
    nome: 'Mouse Logitech',
    preco: 89.90,
    estoque: 15,
    categoria: 'Perifericos'
  },
  {
    nome: 'Teclado Mecânico',
    preco: 349.90,
    estoque: 8,
    categoria: 'Perifericos'
  },
  {
    nome: 'Monitor 24 polegadas',
    preco: 799.00,
    estoque: 5,
    categoria: 'Monitores'
  },
  {
    nome: 'Headset Gamer',
    preco: 199.90,
    estoque: 12,
    categoria: 'Acessorios'
  },
  {
    nome: 'SSD 1TB',
    preco: 450.00,
    estoque: 20,
    categoria: 'Armazenamento'
  },
  {
    nome: 'Webcam HD',
    preco: 129.90,
    estoque: 10,
    categoria: 'Perifericos'
  },
];

async function seedDatabase() {
  try {
    console.log('🔄 Começando a popular o banco...\n');

    // Limpar dados anteriores (opcional)
    await pool.query('DELETE FROM produtos');
    console.log('🗑️  Tabela limpa\n');

    // Inserir produtos
    for (const produto of produtosExemplo) {
      const sql = `
        INSERT INTO produtos (nome, preco, estoque, categoria)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const resultado = await pool.query(sql, [
        produto.nome,
        produto.preco,
        produto.estoque,
        produto.categoria
      ]);

      console.log(`✅ Inserido: ${resultado.rows[0].nome} (Categoria: ${resultado.rows[0].categoria})`);
    }

    console.log('\n✨ Banco de dados populado com sucesso!');

    // Mostrar todos os produtos
    const todos = await pool.query('SELECT * FROM produtos ORDER BY id');
    console.log('\n📋 Produtos cadastrados:');
    console.table(todos.rows);

    // Agrupar por categoria
    const porCategoria = await pool.query(
      'SELECT categoria, COUNT(*) as total FROM produtos GROUP BY categoria'
    );
    console.log('\n📊 Produtos por categoria:');
    console.table(porCategoria.rows);

    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro ao popular banco:', erro.message);
    process.exit(1);
  }
}

seedDatabase();

/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
const { request, response } = require('express');
const express = require('express');
const {v4: uuidv4} = require('uuid');
const app = express();
app.use(express.json());

app.listen(3333, () => {
  console.log('listening your server at http://localhost:3333');
});

const customers = [];

// Middleware
// eslint-disable-next-line require-jsdoc
function verifyIfExistsAccountCPF(request, response, next) {
  const {cpf} = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    return response.status(400).json({error: 'Customer not found'});
  }
  request.customer = customer;
  return next();
}


function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.post('/account', (request, response) => {
  const {cpf, name} = request.body;
  const customerAlreadyExists = customers.some(
      (customer) => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return response.status(400).json({message: 'Customer already exists'});
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const {customer} = request;
  return response.json(customer.statement);
});


app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;
  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation);
  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;

  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient Funds!' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

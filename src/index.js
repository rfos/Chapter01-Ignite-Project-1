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
  const {description, amount} = request.body;
  const {customer} = request;
  const {statementOperation} = {
    description,
    amount,
    createdAt: new Date(),
    type: 'credit',
  };

  console.log(customer);
  console.log(description);
  console.log(amount);

  // Aqui no log do statementOperation retorna 'undefined'
  console.log(statementOperation);
  customer.statement.push(statementOperation);
  return response.status(201).send();
});



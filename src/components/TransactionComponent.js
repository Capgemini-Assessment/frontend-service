import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#root');

const TransactionComponent = () => {
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [transactionModalIsOpen, setTransactionModalIsOpen] = useState(false);
  const [accountModalIsOpen, setAccountModalIsOpen] = useState(false);
  const [currentCustomerName, setCurrentCustomerName] = useState('');
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [initialCredit, setInitialCredit] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    axios.get('http://localhost:8084/api/v1/customer/all')
      .then(response => {
        if (response.data.code === 200) {
          setCustomers(response.data.body);
        } else {
          console.error('Error fetching customers:', response.data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });
  };

  const fetchAccounts = (customerId, customerName) => {
    axios.get('http://localhost:8084/api/v1/account/customer-accounts', {
      params: { customerId }
    })
      .then(response => {
        if (response.data.code === 200) {
          if (response.data.body.length === 0) {
            alert('No accounts have been created yet for this customer.');
          } else {
            setAccounts(response.data.body);
            setCurrentCustomerName(customerName);
            setModalIsOpen(true);
          }
        } else {
          console.error('Error fetching accounts:', response.data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching accounts:', error);
      });
  };

  const fetchTransactions = (accountId) => {
    axios.get('http://localhost:8085/api/v1/transaction/account-transactions', {
      params: { accountId }
    })
      .then(response => {
        if (response.data.code === 200) {
          if (response.data.body.length === 0) {
            alert('No transactions have been made for this account.');
          } else {
            setTransactions(response.data.body);
            setCurrentAccountId(accountId);
            setTransactionModalIsOpen(true);
          }
        } else {
          console.error('Error fetching transactions:', response.data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
      });
  };

  const handleOpenAccount = () => {
    const credit = initialCredit === '' ? 0 : initialCredit;
    axios.post('http://localhost:8084/api/v1/account/open', {
      customerId,
      intialCredit: credit
    })
    .then(response => {
      if (response.data.code === 201) {
        setMessage('Account opened successfully');
        setCustomerId('');
        setInitialCredit('');
      } else {
        setMessage(`Error: ${response.data.message}`);
      }
    })
    .catch(error => {
      setMessage(`Error: ${error.response ? error.response.data : error.message}`);
    });
  };
  

  const openAccountModal = () => {
    setAccountModalIsOpen(true);
  };

  const closeAccountModal = () => {
    setAccountModalIsOpen(false);
    setMessage('');
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setAccounts([]);
    setCurrentCustomerName('');
  };

  const closeTransactionModal = () => {
    setTransactionModalIsOpen(false);
    setTransactions([]);
    setCurrentAccountId(null);
  };

  return (
    <div>
      <header>
        <h1>Account Management App</h1>
      </header>
      <div className="customer-list">
        <h2>Customer List</h2>
        <button onClick={openAccountModal}>Open Account</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.firstName}</td>
                <td>{customer.lastName}</td>
                <td>{customer.email}</td>
                <td>{customer.createdAt}</td>
                <td>
                  <button onClick={() => fetchAccounts(customer.id, `${customer.firstName} ${customer.lastName}`)}>Show Accounts</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Accounts Modal"
      >
        <h2>{currentCustomerName}'s Accounts</h2>
        <button onClick={closeModal}>Close</button>
        <table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Customer ID</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <tr key={account.id}>
                <td>{account.id}</td>
                <td>{account.customerId}</td>
                <td>{account.createdAt}</td>
                <td>
                  <button onClick={() => fetchTransactions(account.id)}>Show Transactions</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>

      <Modal
        isOpen={transactionModalIsOpen}
        onRequestClose={closeTransactionModal}
        style={customStyles}
        contentLabel="Transactions Modal"
      >
        <h2>Transactions for Account {currentAccountId}</h2>
        <button onClick={closeTransactionModal}>Close</button>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Account ID</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.accountId}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.type}</td>
                <td>{transaction.transactionDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>

      <Modal
        isOpen={accountModalIsOpen}
        onRequestClose={closeAccountModal}
        style={customStyles}
        contentLabel="Open Account Modal"
      >
        <h2>Open Account</h2>
        <form onSubmit={(e) => {e.preventDefault(); handleOpenAccount();}}>
          <label>
            Customer ID:
            <input
              type="number"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Initial Credit:
            <input
              type="number"
              value={initialCredit}
              onChange={(e) => setInitialCredit(e.target.value)}
              required={initialCredit !== ''}
            />
          </label>
          <br />
          <button type="submit">Submit</button>
          <button type="button" onClick={closeAccountModal}>Close</button>
        </form>
        {message && <p>{message}</p>}
      </Modal>
    </div>
  );
};



export default TransactionComponent

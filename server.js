const express = require('express'); 
const app = express();
const port = 3000;
const mysql2 = require('mysql2');
const inquirer = require('inquirer');


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const connection = mysql2.createConnection({
  host: 'localhost:3300',
  user: 'root',
  password: 'password',
  database: 'company'
});

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to database');
    return;
  }
  console.log('Connected to database');
});

//TODO: create cli interface to interact with the database

inquirer.prompt([
  {
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'View all employees',
      'View all employees by department',
      'View all employees by manager',
      'Add employee',
      'Remove employee',
      'Update employee role',
      'Update employee manager',
      'View all roles',
      'Add role',
      'Remove role',
      'View all departments',
      'Add department',
      'Remove department',
      'View department budgets',
      'Exit'
    ]
  }
]).then((answers) => {
  switch (answers.action) {
    case 'View all employees':
      viewAllEmployees();
      break;
    case 'View all employees by department':
      viewEmployeesByDepartment();
      break;
    case 'View all employees by manager':
      viewEmployeesByManager();
      break;
    case 'Add employee':
      addEmployee();
      break;
    case 'Remove employee':
      removeEmployee();
      break;
    case 'Update employee role':
      updateEmployeeRole();
      break;
    case 'Update employee manager':
      updateEmployeeManager();
      break;
    case 'View all roles':
      viewAllRoles();
      break;
    case 'Add role':
      addRole();
      break;
    case 'Remove role':
      removeRole();
      break;
    case 'View all departments':
      viewAllDepartments();
      break;
    case 'Add department':
      addDepartment();
      break;
    case 'Remove department':
      removeDepartment();
      break;
    case 'View department budgets':
      viewDepartmentBudgets();
      break;
    case 'Exit':
      connection.end();
      break;
  }
});

function viewAllEmployees() {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    console.table(results);
  });
}

function viewEmployeesByDepartment() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'department',
        message: 'Which department would you like to view?',
        choices: results.map(department => department.name)
      }
    ]).then((answers) => {
      connection.query('SELECT * FROM employees WHERE department_id = ?', [results.find(department => department.name === answers.department).id], (err, results) => {
        if (err) {
          console.log('Error fetching employees');
          return;
        }
        console.table(results);
      });
    });
  });
}

function viewEmployeesByManager() {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'manager',
        message: 'Which manager would you like to view?',
        choices: results.map(employee => employee.manager_id)
      }
    ]).then((answers) => {
      connection.query('SELECT * FROM employees WHERE manager_id = ?', [answers.manager], (err, results) => {
        if (err) {
          console.log('Error fetching employees');
          return;
        }
        console.table(results);
      });
    });
  });
}
//TODO: add remaining functions

function addEmployee() {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) {
      console.log('Error fetching roles');
      return;
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'first_name',
        message: 'Enter the employee\'s first name:'
      },
      {
        type: 'input',
        name: 'last_name',
        message: 'Enter the employee\'s last name:'
      },
      {
        type: 'list',
        name: 'role',
        message: 'Select the employee\'s role:',
        choices: results.map(role => role.title)
      }
    ]).then((answers) => {
      connection.query('INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?)', [answers.first_name, answers.last_name, results.find(role => role.title === answers.role).id], (err, results) => {
        if (err) {
          console.log('Error inserting employee');
          return;
        }
        console.log('Employee added');
      });
    });
  });
}

function removeEmployee() {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: 'Select the employee to remove:',
        choices: results.map(employee => `${employee.first_name} ${employee.last_name}`)
      }
    ]).then((answers) => {
      connection.query('DELETE FROM employees WHERE id = ?', [results.find(employee => `${employee.first_name} ${employee.last_name}` === answers.employee).id], (err, results) => {
        if (err) {
          console.log('Error deleting employee');
          return;
        }
        console.log('Employee removed');
      });
    });
  });
}

function updateEmployeeRole() {
  connection.query('SELECT * FROM employees', (err, employees) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    connection.query('SELECT * FROM roles', (err, roles) => {
      if (err) {
        console.log('Error fetching roles');
        return;
      }
      inquirer.prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Select the employee to update:',
          choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`)
        },
        {
          type: 'list',
          name: 'role',
          message: 'Select the employee\'s new role:',
          choices: roles.map(role => role.title)
        }
      ]).then((answers) => {
        connection.query('UPDATE employees SET role_id = ? WHERE id = ?', [roles.find(role => role.title === answers.role).id, employees.find(employee => `${employee.first_name} ${employee.last_name}` === answers.employee).id], (err, results) => {
          if (err) {
            console.log('Error updating employee');
            return;
          }
          console.log('Employee role updated');
        });
      });
    });
  });
}

function updateEmployeeManager() {
  connection.query('SELECT * FROM employees', (err, employees) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: 'Select the employee to update:',
        choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`)
      },
      {
        type: 'list',
        name: 'manager',
        message: 'Select the employee\'s new manager:',
        choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`)
      }
    ]).then((answers) => {
      connection.query('UPDATE employees SET manager_id = ? WHERE id = ?', [employees.find(employee => `${employee.first_name} ${employee.last_name}` === answers.manager).id, employees.find(employee => `${employee.first_name} ${employee.last_name}` === answers.employee).id], (err, results) => {
        if (err) {
          console.log('Error updating employee');
          return;
        }
        console.log('Employee manager updated');
      });
    });
  });
}

function viewAllRoles() {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) {
      console.log('Error fetching roles');
      return;
    }
    console.table(results);
  });
}

function addRole() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the role title:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the role salary:'
      },
      {
        type: 'list',
        name: 'department',
        message: 'Select the role department:',
        choices: results.map(department => department.name)
      }
    ]).then((answers) => {
      connection.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [answers.title, answers.salary, results.find(department => department.name === answers.department).id], (err, results) => {
        if (err) {
          console.log('Error inserting role');
          return;
        }
        console.log('Role added');
      });
    });
  });
}

function removeRole() {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) {
      console.log('Error fetching roles');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: 'Select the role to remove:',
        choices: results.map(role => role.title)
      }
    ]).then((answers) => {
      connection.query('DELETE FROM roles WHERE id = ?', [results.find(role => role.title === answers.role).id], (err, results) => {
        if (err) {
          console.log('Error deleting role');
          return;
        }
        console.log('Role removed');
      });
    });
  });
}

function viewAllDepartments() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    console.table(results);
  });
}

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the department name:'
    }
  ]).then((answers) => {
    connection.query('INSERT INTO departments (name) VALUES (?)', [answers.name], (err, results) => {
      if (err) {
        console.log('Error inserting department');
        return;
      }
      console.log('Department added');
    });
  });
}

function removeDepartment() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'department',
        message: 'Select the department to remove:',
        choices: results.map(department => department.name)
      }
    ]).then((answers) => {
      connection.query('DELETE FROM departments WHERE id = ?', [results.find(department => department.name === answers.department).id], (err, results) => {
        if (err) {
          console.log('Error deleting department');
          return;
        }
        console.log('Department removed');
      });
    });
  });
}

function viewDepartmentBudgets() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'department',
        message: 'Select the department to view:',
        choices: results.map(department => department.name)
      }
    ]).then((answers) => {
      connection.query('SELECT SUM(salary) AS budget FROM roles WHERE department_id = ?', [results.find(department => department.name === answers.department).id], (err, results) => {
        if (err) {
          console.log('Error fetching budget');
          return;
        }
        console.table(results);
      });
    });
  });
}

function viewAllEmployees() {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    console.table(results);
  });
}

function viewEmployeesByDepartment() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'department',
        message: 'Which department would you like to view?',
        choices: results.map(department => department.name)
      }
    ]).then((answers) => {
      connection.query('SELECT * FROM employees WHERE department_id = ?', [results.find(department => department.name === answers.department).id], (err, results) => {
        if (err) {
          console.log('Error fetching employees');
          return;
        }
        console.table(results);
      });
    });
  });
}

function viewEmployeesByManager() {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'manager',
        message: 'Which manager would you like to view?',
        choices: results.map(employee => employee.manager_id)
      }
    ]).then((answers) => {
      connection.query('SELECT * FROM employees WHERE manager_id = ?', [answers.manager], (err, results) => {
        if (err) {
          console.log('Error fetching employees');
          return;
        }
        console.table(results);
      });
    });
  });
}

function addEmployee() {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) {
      console.log('Error fetching roles');
      return;
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'first_name',
        message: 'Enter the employee\'s first name:'
      },
      {
        type: 'input',
        name: 'last_name',
        message: 'Enter the employee\'s last name:'
      },
      {
        type: 'list',
        name: 'role',
        message: 'Select the employee\'s role:',
        choices: results.map(role => role.title)
      }
    ]).then((answers) => {
      connection.query('INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?)', [answers.first_name, answers.last_name, results.find(role => role.title === answers.role).id], (err, results) => {
        if (err) {
          console.log('Error inserting employee');
          return;
        }
        console.log('Employee added');
      });
    });
  });
}

function removeEmployee() {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: 'Select the employee to remove:',
        choices: results.map(employee => `${employee.first_name} ${employee.last_name}`)
      }
    ]).then((answers) => {
      connection.query('DELETE FROM employees WHERE id = ?', [results.find(employee => `${employee.first_name} ${employee.last_name}` === answers.employee).id], (err, results) => {
        if (err) {
          console.log('Error deleting employee');
          return;
        }
        console.log('Employee removed');
      });
    });
  });

  function updateEmployeeRole() {
    connection.query('SELECT * FROM employees', (err, employees) => {
      if (err) {
        console.log('Error fetching employees');
        return;
      }
      connection.query('SELECT * FROM roles', (err, roles) => {
        if (err) {
          console.log('Error fetching roles');
          return;
        }
        inquirer.prompt([
          {
            type: 'list',
            name: 'employee',
            message: 'Select the employee to update:',
            choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`)
          },
          {
            type: 'list',
            name: 'role',
            message: 'Select the employee\'s new role:',
            choices: roles.map(role => role.title)
          }
        ]).then((answers) => {
          connection.query('UPDATE employees SET role_id = ? WHERE id = ?', [roles.find(role => role.title === answers.role).id, employees.find(employee => `${employee.first_name} ${employee.last_name}` === answers.employee).id], (err, results) => {
            if (err) {
              console.log('Error updating employee');
              return;
            }
            console.log('Employee role updated');
          });
        });
      });
    });
  }

  function updateEmployeeManager() {
    connection.query('SELECT * FROM employees', (err, employees) => {
      if (err) {
        console.log('Error fetching employees');
        return;
      }
      inquirer.prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Select the employee to update:',
          choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`)
        },
        {
          type: 'list',
          name: 'manager',
          message: 'Select the employee\'s new manager:',
          choices: employees.map(employee => `${employee.first_name} ${employee.last_name}`)
        }
      ]).then((answers) => {
        connection.query('UPDATE employees SET manager_id = ? WHERE id = ?', [employees.find(employee => `${employee.first_name} ${employee.last_name}` === answers.manager).id, employees.find(employee => `${employee.first_name} ${employee.last_name}` === answers.employee).id], (err, results) => {
          if (err) {
            console.log('Error updating employee');
            return;
          }
          console.log('Employee manager updated');
        });
      });
    });
  }

  function viewAllRoles() {
    connection.query('SELECT * FROM roles', (err, results) => {
      if (err) {
        console.log('Error fetching roles');
        return;
      }
      console.table(results);
    });
  }
}

function addRole() {  
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the role title:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the role salary:'
      },
      {
        type: 'list',
        name: 'department',
        message: 'Select the role department:',
        choices: results.map(department => department.name)
      }
    ]).then((answers) => {
      connection.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [answers.title, answers.salary, results.find(department => department.name === answers.department).id], (err, results) => {
        if (err) {
          console.log('Error inserting role');
          return;
        }
        console.log('Role added');
      });
    });
  });
}

function removeRole() {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) {
      console.log('Error fetching roles');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: 'Select the role to remove:',
        choices: results.map(role => role.title)
      }
    ]).then((answers) => {
      connection.query('DELETE FROM roles WHERE id = ?', [results.find(role => role.title === answers.role).id], (err, results) => {
        if (err) {
          console.log('Error deleting role');
          return;
        }
        console.log('Role removed');
      });
    });
  });
}

function viewAllDepartments() {

  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    console.table(results);
  }
  );
}

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the department name:'
    }
  ]).then((answers) => {
    connection.query('INSERT INTO departments (name) VALUES (?)', [answers.name], (err, results) => {
      if (err) {
        console.log('Error inserting department');
        return;
      }
      console.log('Department added');
    });
  });
}

function removeDepartment() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    inquirer.prompt([
      {
        type: 'list',
        name: 'department',
        message: 'Select the department to remove:',
        choices: results.map(department => department.name)
      }
    ]).then((answers) => {
      connection.query('DELETE FROM departments WHERE id = ?', [results.find(department => department.name === answers.department).id], (err, results) => {
        if (err) {
          console.log('Error deleting department');
          return;
        }
        console.log('Department removed');
      });
    });
  });
}



app.get('/employees', (req, res) => {
  connection.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    res.json(results);
  });
});

app.get('/employees/:id', (req, res) => {
  connection.query('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error fetching employee');
      return;
    }
    res.json(results);
  });
});

app.post('/employees', (req, res) => {
  connection.query('INSERT INTO employees (name, department, salary) VALUES (?, ?, ?)', [req.body.name, req.body.department, req.body.salary], (err, results) => {
    if (err) {
      console.log('Error inserting employee');
      return;
    }
    res.json(results);
  });
});

app.put('/employees/:id', (req, res) => {
  connection.query('UPDATE employees SET name = ?, department = ?, salary = ? WHERE id = ?', [req.body.name, req.body.department, req.body.salary, req.params.id], (err, results) => {
    if (err) {
      console.log('Error updating employee');
      return;
    }
    res.json(results);
  });
});

app.delete('/employees/:id', (req, res) => {
  connection.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error deleting employee');
      return;
    }
    res.json(results);
  });
});

app.get('/departments', (req, res) => {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      console.log('Error fetching departments');
      return;
    }
    res.json(results);
  });
});

app.get('/departments/:id', (req, res) => {
  connection.query('SELECT * FROM departments WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error fetching department');
      return;
    }
    res.json(results);
  });
});

app.post('/departments', (req, res) => {
  connection.query('INSERT INTO departments (name) VALUES (?)', [req.body.name], (err, results) => {
    if (err) {
      console.log('Error inserting department');
      return;
    }
    res.json(results);
  });
});

app.put('/departments/:id', (req, res) => {
  connection.query('UPDATE departments SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, results) => {
    if (err) {
      console.log('Error updating department');
      return;
    }
    res.json(results);
  });
});

app.delete('/departments/:id', (req, res) => {
  connection.query('DELETE FROM departments WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error deleting department');
      return;
    }
    res.json(results);
  });
});

app.get('/salaries', (req, res) => {
  connection.query('SELECT * FROM salaries', (err, results) => {
    if (err) {
      console.log('Error fetching salaries');
      return;
    }
    res.json(results);
  });
});

app.get('/salaries/:id', (req, res) => {
  connection.query('SELECT * FROM salaries WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error fetching salary');
      return;
    }
    res.json(results);
  });
});

app.post('/salaries', (req, res) => {
  connection.query('INSERT INTO salaries (amount) VALUES (?)', [req.body.amount], (err, results) => {
    if (err) {
      console.log('Error inserting salary');
      return;
    }
    res.json(results);
  });
});

app.put('/salaries/:id', (req, res) => {
  connection.query('UPDATE salaries SET amount = ? WHERE id = ?', [req.body.amount, req.params.id], (err, results) => {
    if (err) {
      console.log('Error updating salary');
      return;
    }
    res.json(results);
  });
});

app.delete('/salaries/:id', (req, res) => {
  connection.query('DELETE FROM salaries WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error deleting salary');
      return;
    }
    res.json(results);
  });
});

app.get('/employees/:id/salary', (req, res) => {
  connection.query('SELECT * FROM salaries WHERE employee_id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error fetching salary');
      return;
    }
    res.json(results);
  });
});

app.get('/departments/:id/employees', (req, res) => {
  connection.query('SELECT * FROM employees WHERE department_id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error fetching employees');
      return;
    }
    res.json(results);
  });
});

app.get('/departments/:id/salaries', (req, res) => {
  connection.query('SELECT * FROM salaries WHERE department_id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log('Error fetching salaries');
      return;
    }
    res.json(results);
  });
});


import React, { Component } from "react";
import { Form, FormControl, Col, Modal, ButtonToolbar } from "react-bootstrap";
import { Button, Typography, Table, FormGroup } from "@material-ui/core";
import ReactSearch from "./ReactSearch";

class incomeModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      item: "",
      description: "",
      amount: "",
      date: "",
      id: "",
      show: false,
      formdata: [],
      incomes: this.props.incomeList
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.showEditModal = this.showEditModal.bind(this);
  }

  showModal() {
    this.setState({ show: true });
  }

  showEditModal(event, i) {
    const recordToEdit = this.state.incomes.filter((item, index) => {
      return index === i;
    })[0];

    this.setState({
      show: true,
      item: recordToEdit.item,
      description: recordToEdit.description,
      amount: recordToEdit.amount,
      date: recordToEdit.date,
      id: recordToEdit.id
    });
  }

  hideModal() {
    this.setState({
      show: false,
      item: "",
      description: "",
      amount: "",
      date: ""
    });
  }

  handleInputChange(event) {
    // update the input that changed
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
    const formItem = {
      item: this.state.item,
      description: this.state.description,
      amount: this.state.amount,
      date: this.state.date,
      id: this.state.id
    };
    const allIds = this.state.incomes.map(income => income.id);
    console.log("allIds: ", allIds);
    console.log("formItem: ", formItem);
    console.log("is it in there? ", allIds.includes(this.state.id));
    if (
      this.state.item === "" ||
      this.state.description === "" ||
      this.state.amount === "" ||
      this.state.date === ""
    ) {
      alert("Please input all fields");
    } else {
      if (allIds.includes(this.state.id)) {
        // update item

        const request = new Request("http://localhost:3001/api/income/:id", {
          method: "PUT",
          headers: new Headers({ "Content-Type": "application/json" }),
          body: JSON.stringify(formItem)
        });
        let that = this;
        let formdata = that.state.formdata;
        formdata.push(formItem);
        that.setState({
          formdata: formdata
        });

        fetch(request)
          .then(response => {
            response.json().then(data => {});
          })
          .catch(function(err) {
            console.log(err);
          });

        alert("income updated!");

        this.setState(prevState => ({
          formdata: prevState.formdata.map(income => {
            if (income.item === formItem.item) return formItem;
            else return income;
          })
        }));
      } else {
        // add new item

        event.preventDefault();
        const request = new Request("http://localhost:3001/api/new-income", {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          body: JSON.stringify(formItem)
        });
        let that = this;
        let incomes = that.state.incomes;
        incomes.push(formItem);
        that.setState({
          formdata: incomes
        });

        fetch(request)
          .then(response => {
            response.json().then(data => {});
          })
          .catch(function(err) {
            console.log(err);
          });

        alert("income submitted!");

        this.setState({
          item: "",
          description: "",
          amount: "",
          date: ""
        });

        event.preventDefault();
      }
    }
  }

  removeincome = id => {
    alert("Are you sure you want to Delete this income?");
    let that = this;
    let incomes = this.state.incomes;
    let income = incomes.find(income => {
      return income.id === id;
    });

    const request = new Request(
      "http://localhost:3001/api/remove-income/" + id,
      {
        method: "DELETE"
      }
    );

    console.log(id);
    fetch(request).then(response => {
      incomes.splice(incomes.indexOf(income), 1);
      that.setState({
        incomes: incomes
      });
      response.json().then(data => {
        console.log(data);
      });
    });
  };

  render() {
    const items = this.state.incomes;
    if (items && items.length > 0) {
      const allItems = items.map(income => income.item);
      const reducer = (accumulator, currentValue) => accumulator + currentValue;
      var incomeAmountArray = [0];
      if (this.state.incomes.length > 0) {
        var incomeAmountArray = this.state.incomes.map(item => {
          return Number(item.amount);
        });
      }
      let total = incomeAmountArray.reduce(reducer);
      let cleanTotal = total.toFixed(2);
      return (
        <div>
          <style>
            {`
            td {
              border: 1px solid black;
              text-align: center
            }`}
          </style>
          <div>
            <Typography variant="display3" align="center" gutterBottom={true}>
              Income Manager
            </Typography>
            <Typography variant="display1" gutterBottom={true}>
              Total incomes: ${cleanTotal}
            </Typography>
            <ReactSearch searchField={allItems} />
            <ButtonToolbar>
              <Button variant="raised" color="primary" onClick={this.showModal}>
                Add Incomes
              </Button>
              <Table>
                <thead>
                  <tr>
                    <th>Income</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.incomes.map((income, i) => (
                    <tr key={i}>
                      <td>{income.item}</td>
                      <td>{income.description}</td>
                      <td>${income.amount}</td>
                      <td>{income.date}</td>
                      <td>{income.id}</td>
                      <td>
                        <Button
                          variant="raised"
                          color="primary"
                          onClick={e => this.showEditModal(e, i)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="raised"
                          color="secondary"
                          onClick={() => this.removeincome(income.id)}
                        >
                          Delete
                        </Button>
                      </td>
                      <td />
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Modal
                {...this.props}
                show={this.state.show}
                onHide={this.hideModal}
                dialogClassName="custom-modal"
                class="col-md-6 col-md-offset-3"
              >
                <Modal.Header closeButton>
                  <Modal.Title
                    id="contained-modal-title-lg "
                    className="text-center"
                  >
                    Add/edit incomes
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body class="col-md-6 col-md-offset-3">
                  <Form horizontal onSubmit={this.handleSubmit}>
                    <FormGroup>
                      <Col smOffset={4} sm={4}>
                        <FormControl
                          type="Text"
                          placeholder="item"
                          name="item"
                          value={this.state.item}
                          onChange={this.handleInputChange}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col smOffset={4} sm={4}>
                        <FormControl
                          type="description"
                          placeholder="description"
                          name="description"
                          value={this.state.description}
                          onChange={this.handleInputChange}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col smOffset={4} sm={4}>
                        <FormControl
                          type="amount"
                          placeholder="amount"
                          name="amount"
                          value={this.state.amount}
                          onChange={this.handleInputChange}
                        />
                      </Col>
                    </FormGroup>
                    <FormGroup>
                      <Col smOffset={4} sm={4}>
                        <FormControl
                          type="date"
                          placeholder="date"
                          name="date"
                          value={this.state.date}
                          onChange={this.handleInputChange}
                        />
                      </Col>
                    </FormGroup>

                    <FormGroup>
                      <Col smOffset={5} sm={4}>
                        <Button variant="raised" color="primary" type="submit">
                          Submit
                        </Button>
                      </Col>
                    </FormGroup>
                  </Form>
                </Modal.Body>
              </Modal>
            </ButtonToolbar>
          </div>
        </div>
      );
    }

    return (
      <Typography variant="display1">
        Slow data connection...Please wait a moment and refresh the page
      </Typography>
    );
  }
}
export default incomeModal;

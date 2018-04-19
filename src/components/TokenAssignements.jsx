import createReactClass from 'create-react-class'
import React from 'react'
import {Table} from 'reactstrap'

const Row = ({address, rowNumber, value}) => (
  <tr>
    <th scope='row'>{rowNumber}</th>
    <td>{address}</td>
    <td>{value.toFormat()}</td>
  </tr>
)

const TokenAssignements = createReactClass({
  getInitialState: () => ({
    assignements: [],
    filter: null
  }),

  async componentDidMount () {
    const {preIcoInstance, preIcoWeb3} = this.props
    const startBlock = await preIcoInstance.startBlock.call()
    const filter = preIcoWeb3.at(preIcoInstance.address).AssignToken(
      null,
      {fromBlock: startBlock},
      async (err, res) => {
        if (err) {
          console.error(err)
          return
        }

        const newAssignements = [res, ...this.state.assignements]
        this.setState({
          assignements: newAssignements
        })
      }
    )

    this.setState({
      filter
    })
  },

  componentWillUnmount () {
    this.state.filter.stopWatching()
  },

  render () {
    const {assignements} = this.state
    const length = assignements.length

    return (
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Account</th>
            <th>XCCs</th>
          </tr>
        </thead>
        <tbody>
          {assignements.map((a, i) => (
            <Row key={a.transactionHash}
              address={a.args.to}
              rowNumber={length - i}
              value={a.args.value.div(this.props.oneXCC)}
            />
          ))}
        </tbody>
      </Table>
    )
  }
})

export default TokenAssignements

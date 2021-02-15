'use strict';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }
//<button onClick={() => this.setState({ liked: true }) }>
            //    Like
            //</button>

    return (
        <div display="block">
            <h2>Town</h2>
            <table cellpadding="5" border="1">
                <tr>
                    <th>One</th>
                    <th>Two</th>
                    <th>Three</th>
                </tr>
                <tr>
                    <td>Hello</td>
                    <td>Hola</td>
                    <td>Bonjur</td>
                </tr>
            </table>
        </div>
    );
  }
}

let domContainer = document.querySelector('#main_container');
ReactDOM.render(<Main/>, domContainer);

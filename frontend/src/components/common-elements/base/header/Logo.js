import React from 'react'
import '../../../../../static/frontend/images/small-logo.png'
import MediaQuery from 'react-responsive'
import axios from "axios"
import logo from "./small-logo.png"

class Logo extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			citename: ""
		}
	}

	componentDidMount() {
		axios.get('/api/get-citename').then(res => {
			const text = res.data.text
			this.setState({citename: text})
		})
	}

	render() {
		return (
			<div className="logo-block">
				<MediaQuery minWidth={801}>
						<img src={logo} className="main-logo" />
						<span
							className="citenamelogo">{this.state.citename}</span>
				</MediaQuery>
				<MediaQuery maxWidth={800}>
						<img src={logo} />
				</MediaQuery>
			</div>
		)
	}
}

export default Logo

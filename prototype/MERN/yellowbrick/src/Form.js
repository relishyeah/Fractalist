import { Component } from "react";
import axios from 'axios'

class Form extends Component{
    constructor(props) {
        super(props);
        
        this.state = {
            query: '',
            weather : '',
            temp: ''
        }
    }

    handleQueryChange =  (event) => {
        this.setState({
            query : event.target.value
        } )

    }
    handleSubmit = (event) =>{
        var url = "http://localhost:3000/?search="+ encodeURIComponent(this.state.query.trim())
        
        axios.get(url,{"Access-Control-Allow-Origin":"*"}).then(response => {
            this.setState({weather:response.data.weather,
            temp:response.data.temp});
        });
        event.preventDefault()
    }
    
    render() {
        const {query} = this.state
        return(
            <form onSubmit = {this.handleSubmit}> 
                <div>
                    <label>Search </label>
                    <input type ="text"
                     value = {query} 
                     onChange = {this.handleQueryChange } 
                     />
                </div>
                <div>
                    <button type="submit">Search</button>
                </div>
                <div>
                    {this.state.weather}
                </div>
                <div>
                    {this.state.temp}
                </div>
            </form>
        )
    }
}

export default Form



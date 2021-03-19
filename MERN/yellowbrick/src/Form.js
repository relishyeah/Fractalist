import { Component } from "react";

class Form extends Component{
    constructor(props) {
        super(props);
        
        this.state = {
            query: ''
        }
    }

    handleQueryChange =  (event) => {
        this.setState({
            query : event.target.value
        } )
    }
    handleSubmit = (event) =>{
        alert(`${this.state.query}`)
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
            </form>
        )
    }
}

export default Form



import React, {Component} from 'react';
import noMovie from '../media/no-movie.png';
import '../styles/App.css';
import moviesService from '../movieService';
import {Button, Glyphicon, Pagination, ButtonToolbar, DropdownButton, MenuItem} from 'react-bootstrap';
import toastr from 'toastr';
import Confirm from './Confirm';
import autoBind from 'react-autobind';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            movies: [],
            total: 0,
            movieToDeleteId: null,
            activePage: 1,
            sortBy: 'title',
            searchStr: ''
        };

        autoBind(this);
    }

    get anyMovies() {
        let movies = this.state.movies;
        return movies && movies.length;
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        moviesService.getMovies(this.state.activePage, this.state.sortBy, this.state.searchStr)
            .then((data) => {
                this.setState({
                    movies: data.dataItems,
                    total: data.total
                })
            });
    }

    confirmDeleteMovie(id) {
        this.setState({
            movieToDeleteId: id
        });
    }

    deleteMovie() {
        moviesService.deleteMovie(this.state.movieToDeleteId)
            .then(() => {
                toastr.success('Movie was deleted');

                this.loadData();

                this.setState({
                    movieToDeleteId: null
                });
            });
    }

    cancelDeleteMovie() {
        this.setState({
            movieToDeleteId: null
        });
    }

    pageSelection(eventKey) {
        this.setState({
            activePage: eventKey
        }, () => {
            //after setSate is completed
            this.loadData();
        });
    }

    sortBy(key) {
        this.setState({
            sortBy: key,
            activePage: 1
        }, () => {
            this.loadData();
        })
    }

    search() {
        this.loadData();
    }

    render() {
        return (
            <div className="App">
                <div className="container">
                    <div className="row">
                        {this.renderFilterBar()}
                        {this.renderMoviesList()}
                    </div>
                </div>
            </div>
        );
    }

    renderMoviesList() {
        if (!this.anyMovies) return (
            <div style={{marginTop: 30}}>No movies.</div>
        );

        let deleteConfirmVisible = this.state.movieToDeleteId ? true : false;

        return (
            <div>
                <div id="movie-list">
                    {
                        this.state.movies.map(movie => this.renderMovie(movie))
                    }
                </div>
                <Confirm visible={deleteConfirmVisible} action={this.deleteMovie} close={this.cancelDeleteMovie}/>
            </div>
        );
    }

    renderFilterBar() {
        let pageNumber = Math.ceil(this.state.total / 10);

        let sortByOptions = [
            {key: 'title', text: 'Title'},
            {key: 'year', text: 'Year'},
            {key: 'runtime', text: 'Movie runtime'},
        ];

        let itemStyle = {marginTop: 23};
        let searchInputStyle = {height: 27, marginRight: 10};

        return (
            <div id="filter-bar" className="row">
                <div className="col-sm-2" style={itemStyle}>
                    <ButtonToolbar>
                        <DropdownButton bsSize="small" title="Sort By:" id="sort-by-dropdown">
                            {sortByOptions.map(item => {
                                return (
                                    <MenuItem key={item.key} onClick={() => this.sortBy(item.key)}
                                              active={this.state.sortBy === item.key}>{item.text}</MenuItem>
                                )
                            })}
                        </DropdownButton>
                    </ButtonToolbar>
                </div>
                <div className="col-sm-4 text-left" style={itemStyle}>
                    <input type="text"
                           value={this.state.searchStr}
                           style={searchInputStyle}
                           onChange={(event) => {
                               this.setState({
                                   searchStr: event.target.value
                               });
                           }}
                           onKeyPress={(target) => {
                               if (target.charCode === 13) {
                                   this.search();
                               }
                           }}
                    />
                    <Button bsStyle="primary" onClick={() => this.search()}>Search</Button>
                </div>
                <div className="col-sm-6 text-right">
                    {this.anyMovies ?
                        <Pagination
                            bsSize="medium"
                            first
                            last
                            ellipsis
                            boundaryLinks
                            maxButtons={5}
                            items={pageNumber}
                            activePage={this.state.activePage}
                            onSelect={this.pageSelection}
                        /> : null
                    }
                </div>
            </div>
        );
    }

    renderMovie(movie) {
        let posterUrl = movie.posterUrl ? movie.posterUrl : noMovie;

        return (
            <div className="movie-row" key={movie.id}>
                <div className="image">
                    <img width={96} height={142} src={posterUrl} title={movie.title} alt={movie.title}/>
                </div>

                <div className="title">
                    <h3>
                        <a href="#">{movie.title}</a>
                        <Button onClick={() => this.confirmDeleteMovie(movie.id)}><Glyphicon glyph="remove"/></Button>
                        <Button><Glyphicon glyph="edit"/></Button>
                    </h3>

                    <p className="movie-info">
                        {movie.year}
                        <span>{movie.runtime + ' min.'}</span>
                        <span>{movie.genres.join(', ')}</span>
                    </p>

                    <p className="actors">
                        {movie.director}
                        <span>{movie.actors}</span>
                    </p>

                    <p className="plot">{movie.plot}</p>
                </div>
            </div>
        );
    }
}

export default App;

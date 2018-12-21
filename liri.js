//require("dotenv").config();
var inquirer = require("inquirer");
var axios = require("axios");
var moment = require("moment");

//var spotify = new Spotify(keys.spotify);

inquirer.prompt([
    {
        type: "list",
        name: "ans",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
        message: "Welcome to LIRI! We can help you find information on music and movies. What would you like to do?"
    }
]).then(res => {
    switchRead(res.ans, "");
    //exclude do-what-it-says so as to avoid potential infinite loop
    if (res.ans === "do-what-it-says")
        readTxt();
});

const switchRead = (ans, str) => {
    //three tildes for spacing; text being saved to the file seems to be trimmed and this may allow for better potential automated parsing than other characters

    switch (ans) {
        //if the client wants a concert
        case "concert-this":
            concertThis(str);
            break;

        //if the user wants to obtain song information
        case "spotify-this-song":
            spotifyThis(str);
            break;

        case "movie-this":
            movieThis(str);
    }
}

const concertThis = str => {
    //either correct the url to use plus instead of space or tell the user they need to give a band or artist name
    if (str !== "") {
        concertSearch(str);
        return;
    }
    inquirer.prompt([
        {
            type: "input",
            name: "band",
            message: "Which band would you like to find concerts for? "
        }
    ]).then(function (artist) {
        concertSearch(artist.band);
    });
}

//search for concerts based on a band/artist input
const concertSearch = str => {
    
    //no default artist searched
    if (str === "") {
        return console.log("Unable to find a concert without a band or artist name.");
    }

    axios.get("https://rest.bandsintown.com/artists/" + str + "/events?app_id=codingbootcamp")
        .then(function (resp) {
            let info = resp.data;
            if (info.length === 0) { //if the artist is not on tour
                console.log("Sorry, but no upcoming concerts were found for that act.");
                return;
            }

            if (info.errorMessage === "[NotFound] The artist was not found") //one of two error checks
                return console.log("Sorry, but we could not find any information on that artist.");

            //print each concert with the venue name, location, and date; use dotted lines to make more legible
            for (let i = 0; i < info.length; i++) {
                
                console.log("Venue Name: " + info[i].venue.name);

                if (info[i].venue.region === "") {
                    console.log("Concert location: " + info[i].venue.city + ", " + info[i].venue.country);
                }
                else
                    console.log("Concert location: " + info[i].venue.city + ", " + info[i].venue.region + " " + info[i].venue.country);

                console.log("Concert Date: " + moment(info[i].datetime).format("MM/DD/YYYY"));
            }
            
            //second error check
        }).catch((error) => {
            if (error) {
                console.log("Sorry, but we could not find any information on that artist.");
            }
        });
}


const spotifyThis = str => {
    var spotify = require("node-spotify-api");
    if (str === "") {
        spotify.search({ type: 'track', query: "the sign ace of base" }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
            if (data.tracks.items.length === 0)
                return report("Sorry, but we could not find any songs with that title.");
            let info = data.tracks.items;
            console.log("-----------------------------------------------------------------------------------------------------------");
            let artistList = info[0].artists;
            for (let a = 0; a < artistList.length; a++) {
                report("Artist: " + artistList[a].name);
            }
            report("Song Name: " + info[0].name);
            if (info[0].preview_url === null)
                report("Preview Link: Unable to find at this time.");
            else
                report("Preview Link: " + info[0].preview_url);
            report("Album Name: " + info[0].album.name);
            console.log("-----------------------------------------------------------------------------------------------------------");
        });
    }
    spotify.search({ type: 'track', query: str }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        if (data.tracks.items.length === 0)
            return report("Sorry, but we could not find any songs with that title.");
        let info = data.tracks.items;
        
        let artistList = info[0].artists;
        for (let a = 0; a < artistList.length; a++) {
            report("Artist: " + artistList[a].name);
        }
        report("Song Name: " + info[0].name);
        if (info[0].preview_url === null)
            report("Preview Link: Unable to find at this time.");
        else
            report("Preview Link: " + info[0].preview_url);
        report("Album Name: " + info[0].album.name);
        
    });

    // axios.get().then(

    // ).catch((error) => {
    //     if (error) {
    //         console.log("Sorry, but we could not find any information on that artist.");
    //     }
    // })
}





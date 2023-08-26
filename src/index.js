// call fetchQuotes() after HTML is loaded
document.addEventListener("DOMContentLoaded", () => {
    fetchQuotes();
})

// get quotes data, call fillPage() and SubmitNewQuote()
function fetchQuotes() {
    fetch("http://localhost:3000/quotes?_embed=likes")
      .then(response => response.json())
      .then(data => fillPage(data))
      .then(submitNewQuote())
      .catch(error => alert(error.message))
}

// fill page with quotes data
function fillPage(quotes) {
    const quoteList = document.querySelector('#quote-list');

    quotes.forEach(quoteObj => {
        const quoteCard = document.createElement('li');
            quoteCard.className = 'quote-card';
        const blockQuote = document.createElement('blockquote');
            blockQuote.className = 'blockquote';

        const {quote, author, id} = quoteObj;
            quoteCard.id = id;
        const myQuote = document.createElement('p');
            myQuote.className = 'mb-0';
            myQuote.textContent = quote;
        const blockFtr = document.createElement('footer');
            blockFtr.className = 'blockquote-footer';
            blockFtr.textContent = author;
        const br = document.createElement('br');
        const likeBtn = document.createElement('button');
            likeBtn.className = 'btn-success';
            likeBtn.textContent = 'Likes: ';
            // like a quote
            likeBtn.addEventListener('click', () => likeQuote(id));
            const likeSpan = document.createElement('span');
                // set likes to current number stored in JSON data
                // if newly created, unliked quote, set likes to []
                // new quotes don't have embedded like array yet
                if (quoteObj.likes === undefined) {
                    quoteObj.likes = [];
                }
                likeSpan.textContent = quoteObj.likes.length;
            likeBtn.append(likeSpan);
        const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger';
            delBtn.textContent = 'Delete';
            // delete a quote
            delBtn.addEventListener('click', () => deleteQuote(id));
        // append quote items to block
        blockQuote.appendChild(myQuote);
        blockQuote.appendChild(blockFtr);
        blockQuote.appendChild(br);
        blockQuote.appendChild(likeBtn);
        blockQuote.appendChild(delBtn);
        // append blockQuote to quoteCard
        quoteCard.appendChild(blockQuote);
        // append quoteCard to quoteList
        quoteList.appendChild(quoteCard);
    })  
}

// submit a new quote to server
function submitNewQuote() {
    const form = document.querySelector('#new-quote-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        // quote, author
        postQuote(event.target[0].value, event.target[1].value);
        form.reset();
    })
}

// make post request with submitted form data, then update DOM with new quote
function postQuote(newQuote, newAuthor) {
    const formData = {
        quote: newQuote,
        author: newAuthor
    }

    const postObj = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(formData)
    }

    fetch("http://localhost:3000/quotes", postObj)
      .then(response => response.json())
      // put posted object into array so fillPage() works correctly
      .then(data => fillPage([data]))
      .catch(error => alert(error.message))
}

// delete a quote from server and DOM, given quoteId
function deleteQuote(quoteId) {
    const delObj = {method: "DELETE"};

    fetch(`http://localhost:3000/quotes/${quoteId}`, delObj)
      .then(() => {
        const quoteCard = document.getElementById(quoteId);
        quoteCard.remove();
      })
      .catch(error => alert(error.message))
}

// like a quote by sending a post request to server, then update DOM
function likeQuote(likedQuoteId) {
    const likeData = {
        quoteId: parseInt(likedQuoteId),
        createdAt: parseInt(Date.now() / 1000)
    }

    const likeObj = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(likeData)
    }

    // post like to server
    fetch("http://localhost:3000/likes/", likeObj)
      .then(() => { 
        // update likes on DOM
        fetch(`http://localhost:3000/likes?quoteId=${likedQuoteId}`)
          .then(response => response.json())
          .then(data => {
            const likeCard = document.getElementById(likedQuoteId);
            const numLikes = likeCard.querySelector('button.btn-success span');
            numLikes.textContent = data.length;
          })
      })
}


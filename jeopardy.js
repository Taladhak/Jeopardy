// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    try {
      const response = await axios.get("https://rithm-jeopardy.herokuapp.com/api/categories?count=100");
      const randomCategories = _.sampleSize(response.data.categories, 6);
      return randomCategories.map(cat => cat.id);
    } catch (error) {
      console.error("Error fetching category IDs:", error);
      return [];
    }
  }
  

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    try {
      const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
      const randomQuestions = _.sampleSize(response.data.clues, 5);
      return {
        id: response.data.id,
        title: response.data.title,
        clues: randomQuestions.map(clue => ({
          question: clue.question,
          answer: clue.answer,
          showing: null
        }))
      };
    } catch (error) {
      console.error(`Error fetching category with ID ${catId}:`, error);
      return null;
    }
  }
  

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
function processCategoryData(categoryData) {
    return {
      id: categoryData.id,
      title: categoryData.title,
      clues: categoryData.clues.map(clue => ({
        question: clue.question,
        answer: clue.answer,
        showing: null
      }))
    };
  }


async function fillTable() {
  const $jeopardyTable = $("#jeopardy");
  $jeopardyTable.empty();

  const $thead = $("<thead>").appendTo($jeopardyTable);
  const $trHead = $("<tr>").appendTo($thead);

  const $tbody = $("<tbody>").appendTo($jeopardyTable);
  const $trBody = [];
  for (let i = 0; i < 5; i++) { // Assume 5 questions per category
    $trBody[i] = $("<tr>").appendTo($tbody);
  }

  const categoryIds = await getCategoryIds();
  categories = await Promise.all(categoryIds.map(catId => getCategory(catId)));

  categories.forEach((category, catIndex) => {
    $("<th>").text(category.title).appendTo($trHead);
    category.clues.forEach((clue, clueIndex) => {
      const $td = $("<td>")
        .html("?")
        .attr("data-cat-id", catIndex)
        .attr("data-clue-id", clueIndex)
        .on("click", handleClick)
        .appendTo($trBody[clueIndex]);
    });
  });
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const $td = $(evt.target);
    const catId = $td.data("cat-id");
    const clueId = $td.data("clue-id");
    const clue = categories[catId].clues[clueId];
  
    if (clue.showing === "answer") {
      // If answer is already shown, do nothing
      return;
    } else if (clue.showing === "question") {
      // If question is shown, show answer
      $td.html(clue.answer);
      clue.showing = "answer";
    } else {
      // If nothing is shown yet, show question
      $td.html(clue.question);
      clue.showing = "question";
    }
}
  

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

    $("#loading").show();

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {

    $("#loading").hide();

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {

    showLoadingView();
    await fillTable();
    hideLoadingView();

}

$(document).ready(function() {
    setupAndStart();
  
    $('#restart').on('click', function() {
      setupAndStart(); 
    });
  }
  );

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
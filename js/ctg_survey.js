
function writeNodesToConsole (nodes) {
    var i;
    for (i = 0; i < nodes.length; i++) {
		console.log(i + ' : ' + nodes[i].nodeName + ' : ' + nodes[i].id);
    }
}

function showTabById(event, tabId) {
    // console.log(tabId.length);
    var divId = tabId.substring(0, tabId.length - 3);  // remove 'Tab'
    // console.log("divId:" + divId);
    showTab(event, divId);
}

function uncheckOptionButton(questionId) {
    var button = document.getElementById(questionId);
    if (button != null) {
        console.log("q:" + button);
        button.checked = false;
    }
}

function hideButton(buttonId) {
    var button = document.getElementById(buttonId);
    if (button != null){
        button.style.display = "none";
    }
}

function showOrHideButton(buttonId, hide){
    button = document.getElementById(buttonId);
    if (button != null) {
        if (hide) {
            button.style.display = "none"
        } else {
            button.style.display = "inline"
        }
    }
}

function showTab(event, divId) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab
    var currentDiv = document.getElementById(divId);
    currentDiv.style.display = "block";

    // and scroll to top
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

    // find tab for selected div and activate it
    var selectedTab = document.getElementById(divId + "Tab");
    if (selectedTab.className.indexOf("active") === -1) {
        selectedTab.className += ' active'
    }

    // show and hide next/previous tab buttons according to tab
    showOrHideButton('NextTabButton', (divId === "AnalysisDiv"));
    showOrHideButton('PreviousTabButton', (divId === "ContextDiv"));

    /* Qualtrics Back and Next are
     * - in questions section always hidden - shown by script on buttons
     * - in answers section, only hidden on intermediate tabs
     */

    // first find out if we are dealing with questions or answers
    var divClasses = currentDiv.className;
    var questionSection = (divClasses.indexOf("ctgCaseQuestion") >= 0);

    if (questionSection){
        hideButton("NextButton");
        hideButton("PreviousButton");
    } else {
        showOrHideButton('NextButton', (divId !== "AnalysisDiv"));
        showOrHideButton('PreviousButton', (divId !== "ContextDiv"));
    }

    // unselect check box for 'ok to continue'
    // this bit of code is rather a hack - uses specific question ids
    // really ought to be generalised if used again
    uncheckOptionButton("QR~QID26~1");
    uncheckOptionButton("QR~QID40~1")
}

function getCurrentTab(){
    var currentTabs = document.getElementsByClassName("tablinks active");
    if (currentTabs.length > 0){
        return currentTabs[0];
    } else {
        return null;
    }
}

function showNextTab() {
    var currentTab = getCurrentTab();
    var currentTabId = currentTab.id;
    var nextTabId = "ContextDivTab";  // default to context
    // console.log('currentTabId:' + currentTabId)

    if (currentTabId === "ContextDivTab") {
        nextTabId = "Trace1DivTab";
    } else if (currentTabId === "Trace1DivTab") {
        nextTabId = "Trace2DivTab";
    } else if (currentTabId === "Trace2DivTab") {
        nextTabId = "Trace3DivTab";
    } else if (currentTabId === "Trace3DivTab") {
        nextTabId = "AnalysisDivTab";
    }
    showTabById(null, nextTabId);
}

function showPreviousTab() {
    var currentTab = getCurrentTab();
    var currentTabId = currentTab.id;
    var previousTabId = "ContextDivTab";  // default to context

    if (currentTabId === "AnalysisDivTab") {
        previousTabId = "Trace3DivTab";
    } else if (currentTabId === "Trace3DivTab") {
        previousTabId = "Trace2DivTab";
    } else if (currentTabId === "Trace2DivTab") {
        previousTabId = "Trace1DivTab";
    }

    showTabById(null, previousTabId);
}

function moveQuestions(targetDiv, questionNodes, questionCount, firstNodeToMove) {
	// note that there are THREE nodes per question in the html that Qualtrics generates
	var i;
	var nodesPerQuestion = 3;
	for (i = 0; i < questionCount * nodesPerQuestion; i++) {
        var questionNode = questionNodes[firstNodeToMove];
        // console.log('questionNode:' + questionNode.id)
        targetDiv.appendChild(questionNode);
	}
}

function createDivForQuestions(divId, questionsDiv, startAtIndex, questionCount, answersSection){
	// create the new div
	var newDiv = document.createElement('div');
	newDiv.id = divId;
	newDiv.className="tabContent";
	if (!answersSection){
	    newDiv.className += " ctgCaseQuestion";
    }

	// insert new div into questions div
	var questionNodes = questionsDiv.childNodes;
	questionsDiv.insertBefore(newDiv, questionNodes[startAtIndex]);

	// move questions into new div
	moveQuestions(newDiv, questionNodes, questionCount, startAtIndex + 1);

	// find if div contains user input errors
	var tabId = newDiv.id + "Tab";
	var selectedTab = document.getElementById(tabId);

	var errorDivs = newDiv.getElementsByClassName("ValidationError");
	var i;
    for (i = 0; i < errorDivs.length; i++) {
		// console.log(i + ' : ' + errorDivs[i].id+ ' : ' + errorDivs[i].textContent);
		if (errorDivs[i].textContent !== "") {
			selectedTab.textContent += " *";
			if (selectedTab.className.indexOf("tabWithErrors") === -1) {
        		selectedTab.className += ' tabWithErrors'
    		}
		}
    }
}

function restructureHTMLforVignette(qualtricsWin, answersSection) {
	var questionsDiv = document.getElementById('Questions');
	// writeNodesToConsole(questionsDiv.childNodes);
	var nodesToIgnore = 3;  // first three are for tabs

	createDivForQuestions('ContextDiv', questionsDiv, nodesToIgnore + 0, 1, answersSection);
	createDivForQuestions('Trace1Div', questionsDiv, nodesToIgnore + 1, 3, answersSection);
	createDivForQuestions('Trace2Div', questionsDiv, nodesToIgnore + 2, 3, answersSection);
	createDivForQuestions('Trace3Div', questionsDiv, nodesToIgnore + 3, 3, answersSection);
	/* the answers section does not contain the 'confirm ready to continue' question
	*  need to take this difference into account when restructuring HTML */
	var numberOfQuestionsInSection = 2;
	// console.log ('answersSection:'+ answersSection);
	if (answersSection === true){
	    numberOfQuestionsInSection = 1
        // console.log ('answersSection is now 1')
    }
	createDivForQuestions('AnalysisDiv', questionsDiv, nodesToIgnore + 4, numberOfQuestionsInSection, answersSection);

	// when first opening page go to tab with errors if there is one, otherwise select Context div
	var errorTabs = document.getElementsByClassName("tabWithErrors")

	if (errorTabs.length === 0) {
		showTab(null, 'ContextDiv');
		// qualtricsWin.hideNextButton();
	} else {
		// console.log(errorTabs.length);
		var errorTab = errorTabs[0];
		// console.log(errorTab.id);
		showTabById(null, errorTab.id);
	}
}

function addNextPrevTabButtons() {
    var buttonsDiv = document.getElementById('Buttons');

    var newButton = document.createElement('Input');
    newButton.type = 'button';
    newButton.id = 'NextTabButton';
    newButton.className = "NextButton";
    newButton.value = "Next → (TAB)";
    newButton.onclick = function(){showNextTab()};
    buttonsDiv.insertBefore(newButton, buttonsDiv.childNodes[1]);

    newButton = document.createElement('Input');
    newButton.type = 'button';
    newButton.id = 'PreviousTabButton';
    newButton.className = "PreviousButton";
    newButton.value = "← Back (TAB)";
    newButton.onclick = function(){showPreviousTab()};
    buttonsDiv.insertBefore(newButton, buttonsDiv.childNodes[0]);
}

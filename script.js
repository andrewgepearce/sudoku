let sudokoState;

////////////////////////////////////////////////////////////////////////////////
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

////////////////////////////////////////////////////////////////////////////////
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

////////////////////////////////////////////////////////////////////////////////
function initSudokoState() {
	sudokoState = [];
	for (let i = 0; i < 9; i++) {
		let col = [];
		for (let j = 0; j < 9; j++) {
			let row = {value: null, annotations: [], c: i + 1, r: j + 1, b: getBoxNumber(i + 1, j + 1)};
			col.push(row);
		}
		sudokoState.push(col);
	}
}

////////////////////////////////////////////////////////////////////////////////
function setValue(col, row, value, bold, colour) {
	if (col > sudokoState.length) return;
	if (col < 1) return;
	if (row > sudokoState[col - 1].length) return;
	if (row < 1) return;
	if (typeof value != "number" || value < 1 || value > 9) return;
	sudokoState[col - 1][row - 1].value = value;
	if (bold != undefined) sudokoState[col - 1][row - 1].valueBold = true;
	if (colour != undefined) sudokoState[col - 1][row - 1].valueColour = colour;
}

////////////////////////////////////////////////////////////////////////////////
function setValueAndClearLinkedAnnotations(col, row, value, bold, colour) {
	setValue(col, row, value, bold, colour);
	let thisBoxNo = getBoxNumber(col, row);
	for (let statecol = 0; statecol < 9; statecol++) {
		for (let staterow = 0; staterow < 9; staterow++) {
			if (statecol == col || staterow == row || getBoxNumber(statecol, staterow) == thisBoxNo) {
				if (sudokoState[statecol][staterow].annotations.includes(value)) {
					const index = sudokoState[statecol][staterow].annotations.indexOf(value);
					if (index > -1) {
						sudokoState[statecol][staterow].annotations.splice(index, 1);
					}
				}
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
function clearValue(col, row) {
	if (col > sudokoState.length) return;
	if (col < 0) return;
	if (row > sudokoState[col - 1].length) return;
	if (row < 1) return;
	if (typeof value != "number" || value < 1 || value > 9) return;
	sudokoState[col - 1][row - 1].value = null;
}

////////////////////////////////////////////////////////////////////////////////
function setAnnotation(col, row, annotation) {
	if (col > sudokoState.length) return;
	if (col < 1) return;
	if (row > sudokoState[col - 1].length) return;
	if (row < 1) return;
	if (typeof annotation != "number" || annotation < 1 || annotation > 9) return;
	if (!sudokoState[col - 1][row - 1].annotations.includes(annotation)) {
		sudokoState[col - 1][row - 1].annotations.push(annotation);
		sudokoState[col - 1][row - 1].annotations.sort(function (a, b) {
			return a - b;
		});
	}
}

////////////////////////////////////////////////////////////////////////////////
function setAnnotations(col, row, annotations) {
	clearAnnotations(col, row);
	if (!Array.isArray(annotations)) return;
	annotations.sort(function (a, b) {
		return a - b;
	});
	for (let i = 0; i < annotations.length; i++) {
		sudokoState[col - 1][row - 1].annotations.push(annotations[i]);
	}
}

////////////////////////////////////////////////////////////////////////////////
function clearAnnotation(col, row, annotation) {
	if (col > sudokoState.length) return;
	if (col < 1) return;
	if (row > sudokoState[col - 1].length) return;
	if (row < 1) return;
	if (typeof annotation != "number" || annotation < 1 || annotation > 9) return;
	const index = sudokoState[col - 1][row - 1].annotations.indexOf(annotation);
	if (index > -1) {
		sudokoState[col - 1][row - 1].annotations.splice(index, 1);
	}
}

////////////////////////////////////////////////////////////////////////////////
function clearAnnotations(col, row) {
	if (col > sudokoState.length) return;
	if (col < 1) return;
	if (row > sudokoState[col - 1].length) return;
	if (row < 1) return;
	sudokoState[col - 1][row - 1].annotations = [];
}

////////////////////////////////////////////////////////////////////////////////
function drawGridFromState() {
	if (!Array.isArray(sudokoState)) return;
	// Loop over each column
	for (let col = 1; col <= sudokoState.length; col++) {
		let columnArray = sudokoState[col - 1];
		if (!Array.isArray(columnArray)) columnArray = [];
		// Loop over each row
		for (let row = 1; row <= columnArray.length; row++) {
			let columnRowObject = columnArray[row - 1];
			let value = columnRowObject.value;
			let annotations = columnRowObject.annotations;
			if (!Array.isArray(annotations)) annotations = [];
			// We have a value - display value and hide annotations
			if (typeof value == "number" && value >= 1 && value <= 9) {
				let cellresult = document.getElementById(`cell-c${col}-r${row}-result`);
				cellresult.style.color = "black";
				cellresult.innerHTML = value;
				if (columnRowObject.valueBold === true) {
					cellresult.innerHTML = `<b>${cellresult.innerHTML}</b>`;
				}
				if (typeof columnRowObject.valueColour === "string") {
					cellresult.innerHTML = `<span style="color:${columnRowObject.valueColour}">${cellresult.innerHTML}</span>`;
				}
				cellresult.style.display = "grid";
				for (let a = 1; a <= 9; a++) {
					let anno = document.getElementById(`cell-c${col}-r${row}-a${a}`);
					if (anno != undefined) {
						if (annotations.includes(a)) {
							anno.innerHTML = a;
						} else {
							anno.innerHTML = "";
						}
						anno.style.display = "none";
						anno.style.color = "black";
						anno.style.removeProperty("border");
					}
				}
			}
			// We don't have a value - hide value and display annotations
			if (typeof value != "number" || value < 1 || value > 9) {
				let cellresult = document.getElementById(`cell-c${col}-r${row}-result`);
				cellresult.innerHTML = "";
				cellresult.style.display = "none";
				for (let a = 1; a <= 9; a++) {
					let anno = document.getElementById(`cell-c${col}-r${row}-a${a}`);
					if (anno != undefined) {
						if (annotations.includes(a)) {
							anno.innerHTML = a;
						} else {
							anno.innerHTML = "";
						}
						anno.style.display = "grid";
						anno.style.color = "black";
						anno.style.removeProperty("border");
					}
				}
			}
		}
	}
}

////////////////////////////////////////////////
function drawgrid(containerid) {
	let container = document.getElementById(containerid);
	for (let i = 1; i <= 9; i++) {
		let sudbox = document.createElement("div");
		let col = i == 1 || i == 4 || i == 7 ? 1 : i == 2 || i == 5 || i == 8 ? 2 : 3;
		let row = i < 4 ? 1 : i < 7 ? 2 : 3;
		sudbox.className = [`sudbox r${row} c${col}`];
		sudbox.id = `box${i}`;
		container.appendChild(sudbox);
		for (let j = 1; j <= 9; j++) {
			let sudcell = document.createElement("div");
			let cellcol = j == 1 || j == 4 || j == 7 ? 1 : j == 2 || j == 5 || j == 8 ? 2 : 3;
			let cellcolwhole = (col - 1) * 3 + cellcol;
			let cellrow = j < 4 ? 1 : j < 7 ? 2 : 3;
			let cellrowwhole = (row - 1) * 3 + cellrow;
			sudcell.className = [`sudcell r${cellrow} c${cellcol} box${i} col${cellcolwhole} row${cellrowwhole}`];
			sudcell.id = `cell-c${cellcolwhole}-r${cellrowwhole}`;
			let dd = document.createElement("div");
			dd.className = "dropdown";
			let ddbtn = document.createElement("button");
			ddbtn.className = "dropbtn";
			ddbtn.innerHTML = "...";
			dd.appendChild(ddbtn);
			let ddcontent = document.createElement("div");
			ddcontent.className = "dropdown-content";

			dd.appendChild(ddcontent);
			for (let k = 1; k <= 9; k++) {
				let val = document.createElement("a");
				val.innerHTML = k;
				val.addEventListener("click", (e) => {
					sudokoState[cellcolwhole - 1][cellrowwhole - 1].value = k;
					drawGridFromState();
				});
				ddcontent.appendChild(val);
			}
			let clearval = document.createElement("a");
			clearval.innerHTML = "clear";
			clearval.addEventListener("click", (e) => {
				sudokoState[cellcolwhole - 1][cellrowwhole - 1].value = null;
				drawGridFromState();
			});
			ddcontent.appendChild(clearval);
			sudcell.appendChild(dd);

			sudcell.addEventListener("click", (e) => {
				let b = document.getElementById("buildano");
				if (b.disabled == true) return;
				let dd = document.getElementById(e.target.id + "-dropdown");
				if (dd.style.display == "none") {
					dd.style.left = e.clientX + 10;
					dd.style.top = e.clientY + 10;
					dd.style.display = "block";
				}
			});

			sudbox.appendChild(sudcell);
			for (let k = 1; k <= 9; k++) {
				let sudanno = document.createElement("div");
				let annocol = k == 1 || k == 4 || k == 7 ? 1 : k == 2 || k == 5 || k == 8 ? 2 : 3;
				let annorow = k < 4 ? 1 : k < 7 ? 2 : 3;
				sudanno.className = [`sudannotation r${annorow} c${annocol}`];
				sudanno.id = `cell-c${cellcolwhole}-r${cellrowwhole}-a${k}`;
				sudanno.innerHTML = k;
				sudanno.style.display = "none";
				sudcell.appendChild(sudanno);
			}
			let sudcellresult = document.createElement("div");
			sudcellresult.className = [`sudcellresult`];
			sudcellresult.id = `cell-c${cellcolwhole}-r${cellrowwhole}-result`;
			sudcellresult.style.display = "none";
			sudcellresult.innerHTML = "";

			sudcell.appendChild(sudcellresult);
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
function markResult(col, row, result) {
	for (let k = 1; k <= 9; k++) {
		let anno = document.getElementById(`cell-c${col}-r${row}-a${k}`);
		anno.style.display = "none";
	}
	let res = document.getElementById(`cell-c${col}-r${row}-result`);
	res.innerHTML = result;
	res.style.display = "grid";
}

////////////////////////////////////////////////////////////////////////////////
function markAnnotations(col, row, annotations) {
	let res = document.getElementById(`cell-c${col}-r${row}-result`);
	if (Array.isArray(annotations) && res != undefined) {
		for (let i = 0; i < annotations.length; i++) {
			let anno = document.getElementById(`cell-c${col}-r${row}-a${annotations[i]}`);
			if (anno != undefined) {
				anno.style.display = "grid";
			}
		}
		res.style.display = "none";
		res.innerHTML = "";
	}
}

////////////////////////////////////////////////////////////////////////////////
function inBox(boxNo, value) {
	let cells = document.querySelectorAll(`.box${boxNo} .sudcellresult`);
	for (let i = 0; i < cells.length; i++) {
		if (cells[i].innerHTML === "" + value) return true;
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////
function inRow(rowNo, value) {
	let cells = document.querySelectorAll(`.row${rowNo} .sudcellresult`);
	for (let i = 0; i < cells.length; i++) {
		if (cells[i].innerHTML === "" + value) return true;
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////
function inCol(colNo, value) {
	let cells = document.querySelectorAll(`.col${colNo} .sudcellresult`);
	for (let i = 0; i < cells.length; i++) {
		if (cells[i].innerHTML === "" + value) return true;
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////
function getBoxNumber(col, row) {
	if (col <= 3 && row <= 3) {
		return 1;
	} else if (col <= 6 && row <= 3) {
		return 2;
	} else if (col <= 9 && row <= 3) {
		return 3;
	} else if (col <= 3 && row <= 6) {
		return 4;
	} else if (col <= 6 && row <= 6) {
		return 5;
	} else if (col <= 9 && row <= 6) {
		return 6;
	} else if (col <= 3 && row <= 9) {
		return 7;
	} else if (col <= 6 && row <= 9) {
		return 8;
	} else if (col <= 9 && row <= 9) {
		return 9;
	} else {
		return 1;
	}
}

////////////////////////////////////////////////////////////////////////////////
function _inBox(col, row, value) {
	let thisBoxNo = getBoxNumber(col, row);
	for (let i = 1; i <= 9; i++) {
		for (let j = 1; j <= 9; j++) {
			// We are in the same box
			if (thisBoxNo === getBoxNumber(i, j) && sudokoState[i - 1][j - 1].value === value) {
				return true;
			}
		}
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////
function _inCol(col, value) {
	for (let j = 1; j <= 9; j++) {
		if (sudokoState[col - 1][j - 1].value === value) {
			return true;
		}
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////
function _inRow(row, value) {
	for (let i = 1; i <= 9; i++) {
		if (sudokoState[i - 1][row - 1].value === value) {
			return true;
		}
	}
	return false;
}

////////////////////////////////////////////////////////////////////////////////
function buildInitialAnnotations() {
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			let obj = sudokoState[i][j];
			// console.log(obj);
			if (typeof obj.value == "number" && obj.value >= 1 && obj.value <= 9) {
				continue;
			}
			// No value, fill the annotations
			for (let a = 1; a <= 9; a++) {
				if (!_inBox(obj.c, obj.r, a) && !_inCol(obj.c, a) && !_inRow(obj.r, a)) {
					setAnnotation(obj.c, obj.r, a);
				}
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
function setColour(col, row, annotation, colour, border) {
	if (col > sudokoState.length) return;
	if (col < 1) return;
	if (row > sudokoState[col - 1].length) return;
	if (row < 1) return;
	if (annotation != undefined && annotation != null) {
		if (typeof annotation != "number" || annotation < 1 || annotation > 9) {
			return;
		}
		let item = document.getElementById(`cell-c${col}-r${row}-a${annotation}`);
		if (item != undefined) {
			item.style.color = colour;
			if (border != undefined) item.style.border = `1 solid ${colour}`;
		}
	} else {
		let item = document.getElementById(`cell-c${col}-r${row}-result`);
		if (item != undefined) {
			item.style.color = colour;
			if (border != undefined) item.style.border = `1 solid ${colour}`;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
function setBorder(col, row, annotation, colour) {
	if (col > sudokoState.length) return;
	if (col < 1) return;
	if (row > sudokoState[col - 1].length) return;
	if (row < 1) return;
	if (annotation != undefined && annotation != null) {
		if (typeof annotation != "number" || annotation < 1 || annotation > 9) {
			return;
		}
		let item = document.getElementById(`cell-c${col}-r${row}-a${annotation}`);
		if (item != undefined) {
			item.style.border = `1px solid ${colour}`;
			item.style.padding = `1px`;
		}
	} else {
		let item = document.getElementById(`cell-c${col}-r${row}-result`);
		if (item != undefined) {
			item.style.color = colour;
			item.style.border = `1px solid ${colour}`;
			item.style.padding = `1px`;
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
function findNextRuleToApply() {
	//////////
	// Rule 1 - Lone Single
	let r1 = new Rule_LoneSingle();
	res = r1.nextSingleAnnotation();
	if (res != undefined) {
		let info = document.getElementById("ruleinfo");
		info.innerHTML = res.html;
		document.getElementById("ruleexec").addEventListener("click", () => {
			r1.action(res);
			drawGridFromState();
			document.getElementById("rulefind").disabled = false;
			document.getElementById("ruleexec").disabled = true;
			info.innerHTML = "";
		});
		return;
	}
	//////////
	// Rule 2 - Hidden Single
	let r2 = new Rule_HiddenSingle();
	res = r2.nextHiddenSingleAnnotation();
	if (res != undefined) {
		let info = document.getElementById("ruleinfo");
		info.innerHTML = res.html;
		document.getElementById("ruleexec").addEventListener("click", () => {
			r2.action(res);
			drawGridFromState();
			document.getElementById("rulefind").disabled = false;
			document.getElementById("ruleexec").disabled = true;
			info.innerHTML = "";
		});
		return;
	}
	document.getElementById("rulefind").disabled = true;
	document.getElementById("ruleexec").disabled = true;
	info.innerHTML = "";
}

////////////////////////////////////////////////////////////////////////////////
function markAnnotationsToBeRemovedAfterValueIdentified(col, row, value, result) {
	// remove any and all annotation in all cells other than this col/row with this annotation
	let thisBoxNo = getBoxNumber(col, row);
	for (let othercol = 1; othercol <= 9; othercol++) {
		for (let otherrow = 1; otherrow <= 9; otherrow++) {
			let index = sudokoState[othercol - 1][otherrow - 1].annotations.indexOf(value);
			if (othercol == col && otherrow != row && index != -1) {
				setColour(othercol, otherrow, value, "purple");
				setBorder(othercol, otherrow, value, "purple");
				result.annotationsToRemove.push({c: othercol, r: otherrow, v: value});
				result.html += `<li>Can remove dead annotation in row ${otherrow} column ${othercol} (matched in column) </li>`;
			}
			if (othercol != col && otherrow == row && index != -1) {
				setColour(othercol, otherrow, value, "purple");
				setBorder(othercol, otherrow, value, "purple");
				result.annotationsToRemove.push({c: othercol, r: otherrow, v: value});
				result.html += `<li>Can remove dead annotation in row ${otherrow} column ${othercol} (matched in row) </li>`;
			}
			if (othercol != col && otherrow != row && thisBoxNo == getBoxNumber(othercol, otherrow) && index != -1) {
				setColour(othercol, otherrow, value, "purple");
				setBorder(othercol, otherrow, value, "purple");
				result.annotationsToRemove.push({c: othercol, r: otherrow, v: value});
				result.html += `<li>Can remove dead annotation in row ${otherrow} column ${othercol} (matched in box ${thisBoxNo}) </li>`;
			}
		}
	}
	let markedCellAnnotations = sudokoState[col - 1][row - 1].annotations;
	for (let i = 0; i < markedCellAnnotations.length; i++) {
		if (markedCellAnnotations[i] != value) {
			setColour(col, row, markedCellAnnotations[i], "purple");
			setBorder(col, row, markedCellAnnotations[i], "purple");
		}
		result.annotationsToRemove.push({c: col, r: row, v: markedCellAnnotations[i]});
		result.html += `<li>Can remove dead annotation in row ${row} column ${col} with value ${markedCellAnnotations[i]} </li>`;
	}

	return result;
}

////////////////////////////////////////////////////////////////////////////////
class Rule_LoneSingle {
	// Get a description of the rule
	getDescription() {
		return (
			'"Lone Single". Any cells with a single annotation only should be marked as having the result of that annotation. Any annotations in other cells with that value ' +
			"in the same box as this cell, or in the same row as this cell, or the same columns as this cell, should have that annotation removed"
		);
	}
	// Get the first cell encountered with a single annotation value
	nextSingleAnnotation() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let obj = sudokoState[i][j];
				if (typeof obj.value == "number" && obj.value >= 1 && obj.value <= 9) {
					continue;
				}
				if (obj.annotations.length == 1) {
					let col = i + 1;
					let row = j + 1;
					let val = obj.annotations[0];
					let thisBoxNo = getBoxNumber(col, row);
					setColour(col, row, val, "red");
					let result = {
						completeWithVal: {c: col, r: row, v: val},
						annotationsToRemove: [],
						html:
							`<p>Rule #1: ${this.getDescription()}</p><ul>` +
							`<li  style="font-weight: bold;">Single annotation value of ${val} found in row ${row} column ${col} (box ${thisBoxNo})</li>`,
					};
					result = markAnnotationsToBeRemovedAfterValueIdentified(col, row, val, result);
					result.html += "</ul>";
					return result;
				}
			}
		}
		return undefined;
	}
	// Set value and clear dead annotations from state
	action(result) {
		if (result.completeWithVal != undefined)
			setValue(result.completeWithVal.c, result.completeWithVal.r, result.completeWithVal.v, true, "darkgreen");
		for (let i = 0; i < result.annotationsToRemove.length; i++) {
			clearAnnotation(result.annotationsToRemove[i].c, result.annotationsToRemove[i].r, result.annotationsToRemove[i].v);
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
class Rule_HiddenSingle {
	// Get a description of the rule
	getDescription() {
		return (
			'"Hidden Single". Any rows with a single annotation value in that row, column or box must equal that value. Any annotations in other cells with that value ' +
			"in the same box as this cell, or in the same row as this cell, or the same columns as this cell, should have that annotation removed."
		);
	}
	// Get the first cell encountered with a single annotation value
	nextHiddenSingleAnnotation() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let obj = sudokoState[i][j];
				if (typeof obj.value == "number" && obj.value >= 1 && obj.value <= 9) {
					continue;
				}
				let col = i + 1;
				let row = j + 1;
				let thisBoxNo = getBoxNumber(col, row);
				for (let k = 0; k < obj.annotations.length; k++) {
					let annotationValue = obj.annotations[k];
					//////////////////////////////////////////////////////////////////////
					// Any other annotations with this value in this column?
					let countInColumn = 0;
					let foundInRow = null;
					for (let rowstate = 0; rowstate < 9; rowstate++) {
						if (sudokoState[i][rowstate].annotations.includes(annotationValue)) {
							countInColumn++;
							foundInRow = rowstate + 1;
						}
					}
					if (countInColumn == 1) {
						let result = {
							completeWithVal: {c: col, r: row, v: annotationValue},
							annotationsToRemove: [],
							html:
								`<p>Rule #2: ${this.getDescription()}</p><ul>` +
								`<li style="font-weight: bold;">Annotation ${annotationValue} only found once in column ${col} (row ${foundInRow})</li>`,
						};
						setColour(col, foundInRow, annotationValue, "red");
						result = markAnnotationsToBeRemovedAfterValueIdentified(col, row, annotationValue, result);
						result.html += "</ul>";
						return result;
					}
					//////////////////////////////////////////////////////////////////////
					// Any other annotations with this value in this row?
					let countInRow = 0;
					let foundInColumn = null;
					for (let colstate = 0; colstate < 9; colstate++) {
						if (sudokoState[colstate][j].annotations.includes(annotationValue)) {
							countInRow++;
							foundInColumn = colstate + 1;
						}
					}
					if (countInRow == 1) {
						let result = {
							completeWithVal: {c: col, r: row, v: annotationValue},
							annotationsToRemove: [],
							html:
								`<p>Rule #2: ${this.getDescription()}</p><ul>` +
								`<li style="font-weight: bold;">Annotation ${annotationValue} only found once in row ${row} (column ${foundInColumn})</li>`,
						};
						setColour(foundInColumn, row, annotationValue, "red");
						result = markAnnotationsToBeRemovedAfterValueIdentified(col, row, annotationValue, result);
						result.html += "</ul>";
						return result;
					}
					//////////////////////////////////////////////////////////////////////
					// Any other annotations with this value in this box?
					let countInBox = 0;
					for (let colstate = 0; colstate < 9; colstate++) {
						for (let rowstate = 0; rowstate < 9; rowstate++) {
							if (sudokoState[colstate][rowstate].value != undefined) continue;
							if (sudokoState[colstate][rowstate].b == thisBoxNo && sudokoState[colstate][rowstate].annotations.includes(annotationValue)) {
								countInBox++;
								foundInColumn = colstate;
								foundInRow = rowstate;
							}
						}
					}
					if (countInBox == 1) {
						let result = {
							completeWithVal: {c: col, r: row, v: annotationValue},
							annotationsToRemove: [],
							html:
								`<p>Rule #2: ${this.getDescription()}</p><ul>` +
								`<li style="font-weight: bold;">Annotation ${annotationValue} only found once in box ${thisBoxNo} (row ${
									foundInRow + 1
								}, column ${foundInColumn + 1})</li>`,
						};
						setColour(col, row, annotationValue, "red");
						result = markAnnotationsToBeRemovedAfterValueIdentified(col, row, annotationValue, result);
						result.html += "</ul>";
						return result;
					}
				}
			}
		}
		return undefined;
	}
	// Set value and clear dead annotations from state
	action(result) {
		if (result.completeWithVal != undefined)
			setValue(result.completeWithVal.c, result.completeWithVal.r, result.completeWithVal.v, true, "darkgreen");
		for (let i = 0; i < result.annotationsToRemove.length; i++) {
			clearAnnotation(result.annotationsToRemove[i].c, result.annotationsToRemove[i].r, result.annotationsToRemove[i].v);
		}
	}
}
////////////////////////////////////////////////////////////////////////////////
initSudokoState();
setValue(1, 1, 3, true);
setValue(2, 1, 6, true);
setValue(4, 1, 7, true);
setValue(6, 1, 4, true);
setValue(7, 1, 9, true);
setValue(7, 2, 1, true);
setValue(2, 3, 4, true);
setValue(3, 3, 9, true);
setValue(5, 3, 6, true);
setValue(5, 4, 8, true);
setValue(6, 4, 6, true);
setValue(8, 4, 7, true);
setValue(9, 4, 2, true);
setValue(4, 5, 2, true);
setValue(6, 5, 7, true);
setValue(1, 6, 5, true);
setValue(2, 6, 7, true);
setValue(4, 6, 1, true);
setValue(5, 6, 4, true);
setValue(5, 7, 2, true);
setValue(7, 7, 7, true);
setValue(8, 7, 4, true);
setValue(3, 8, 6, true);
setValue(3, 9, 3, true);
setValue(4, 9, 4, true);
setValue(6, 9, 8, true);
setValue(8, 9, 1, true);
setValue(9, 9, 9, true);
drawgrid("sudmain");
drawGridFromState();

document.getElementById("finalisecells").disabled = false;
document.getElementById("buildano").disabled = true;
document.getElementById("rulefind").disabled = true;
document.getElementById("ruleexec").disabled = true;
document.getElementById("finalisecells").addEventListener("click", () => {
	document.getElementById("buildano").disabled = false;
	document.getElementById("finalisecells").disabled = true;
	let dds = document.getElementsByClassName("dropdown");
	for (let i = 0; i < dds.length; i++) {
		dds[i].style.display = "none";
	}
});

document.getElementById("buildano").addEventListener("click", () => {
	buildInitialAnnotations();
	drawGridFromState();
	document.getElementById("buildano").disabled = true;
	document.getElementById("rulefind").disabled = false;
	//clearAnnotation(1, 9, 7);
	//drawGridFromState();
});

document.getElementById("rulefind").addEventListener("click", () => {
	findNextRuleToApply();
	document.getElementById("rulefind").disabled = true;
	document.getElementById("ruleexec").disabled = false;
});

//buildInitialAnnotations();

// setValue(2, 7, 6);
// setAnnotations(1, 2, [1, 2, 5]);
// drawgrid("sudmain");
// drawGridFromState();
// clearAnnotation(1, 9, 7);
// drawGridFromState();

// console.log(new rule1().nextSingleAnnotation());

// // markResult(1, 1, "R");
// // markResult(2, 7, "R");
// // markAnnotations(1, 2, [1, 2, 5]);
// console.log("In box 1 = " + inBox(1, 6));
// console.log("In box 2 = " + inBox(2, 6));
// console.log("In box 7 = " + inBox(7, 6));
// console.log("In row 1 = " + inRow(1, 6));
// console.log("In row 2 = " + inRow(2, 6));
// console.log("In row 7 = " + inRow(7, 6));
// console.log("In col 1 = " + inCol(1, 6));
// console.log("In col 2 = " + inCol(2, 6));
// console.log("In col 7 = " + inCol(7, 6));

// Hi James, Hope you are well. Seems to be "radio silence" from Colman with substantive feedback since the interview on Tuesday. Any particular reasons I should be aware of? Or is it just "process" that is taking its time?

// Hi James,

// Hope you are well.

// Seems to be "radio silence" from Colman with any substantive feedback on Tuesday's interview. Any particular reasons I should be aware of? Or is it just "process" that is taking its time?

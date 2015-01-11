/*global observable, _ */
(function () {
	'use strict';
	var ScenarioModel = function (itemChooser) {
		var self = observable(this),
			nouns, verbs, numSteps,
			nonsenseExclusions = {},
			sequenceExclusions = {},
			repetitionMode = ScenarioModel.ALLOW_REPETITION,
			isBlank = function (s) {
				return _.isEmpty(s) || s.trim().length === 0;
			},
			randomChooser = function (arr) {
				return arr[Math.floor(Math.random() * arr.length)];
			},
			availableVerbsFor = function (noun) {
				var exclusions = _.keys(_.extend({}, nonsenseExclusions[noun], sequenceExclusions[noun]));
				return _.difference(verbs, exclusions);
			},
			noAvailableVerbs = function (noun) {
				return _.isEmpty(availableVerbsFor(noun));
			},
			chooseStep = function () {
				var availableNouns = _.reject(nouns, noAvailableVerbs), noun, verb;
				if (_.isEmpty(availableNouns)) {
					return false;
				}
				noun = itemChooser(availableNouns);
				verb = itemChooser(availableVerbsFor(noun));
				return {'verb': verb, 'noun':	noun};
			},
			addToSequenceExclusions = function (step) {
				if (repetitionMode === ScenarioModel.NO_SEQUENCE) {
					sequenceExclusions = {};
					sequenceExclusions[step.noun] = {};
					sequenceExclusions[step.noun][step.verb] = true;
				} else if (repetitionMode === ScenarioModel.UNIQUE_STEPS) {
					sequenceExclusions[step.noun] = sequenceExclusions[step.noun] ||  {};
					sequenceExclusions[step.noun][step.verb] = true;
				}
			},
			generate = function () {
				var result = [], step, index;
				sequenceExclusions = {};
				if (!numSteps) {
					return false;
				}

				for (index = 0; index < numSteps; index++) {
					step = chooseStep();
					if (!step) {
						return false;
					}
					result.push(step);
					addToSequenceExclusions(step);
				}
				return result;
			},
			parseList = function (argList) {
				if(_.isString(argList)) {
					argList = argList.split('\n');
				}
				return _.unique(_.reject(argList, isBlank));
			};

			itemChooser = itemChooser || randomChooser;
			self.markNonsense = function (step) {
				if (!nonsenseExclusions[step.noun]) {
					nonsenseExclusions[step.noun] = {};
				}
				nonsenseExclusions[step.noun][step.verb] = true;
			};
			self.markNotNonsense = function (step) {
				if (nonsenseExclusions && nonsenseExclusions[step.noun]) {
					delete nonsenseExclusions[step.noun][step.verb];
				}
			};
			self.setNouns = function (newNouns) {
				nouns=parseList(newNouns);
			};
			self.getNouns = function () {
				return nouns;
			};
			self.setVerbs = function (newVerbs) {
				verbs = parseList(newVerbs);
			};
			self.getVerbs = function () {
				return verbs;
			};
			self.setNumSteps = function (numStepsText) {
				numSteps = parseInt(numStepsText, 10);
			};
			self.getExclusions = function () {
				if (_.isEmpty(nonsenseExclusions)) {
					return [];
				}
				var result = [];
				_.each(_.keys(nonsenseExclusions).sort(), function (noun) {
					_.each(_.keys(nonsenseExclusions[noun]).sort(), function (verb) {
						result.push({'noun': noun, 'verb': verb});
					});
				});
				return result;
			};
			self.nextScenario = function () {
				var scenario = generate();
				if (scenario) {
					self.dispatchEvent('scenarioGenerated', scenario);
					return true;
				}
				return false;
			};
			self.setRepetitionMode = function (newRepetitionMode) {
				repetitionMode = newRepetitionMode;
			};
		};
	ScenarioModel.ALLOW_REPETITION = 1;
	ScenarioModel.UNIQUE_STEPS = 2;
	ScenarioModel.NO_SEQUENCE = 3;
	window.Q3 = window.Q3 || {};
	window.Q3.ScenarioModel = ScenarioModel;
})();

/*global observable, _ */
(function () {
	'use strict';
	var ScenarioModel = function (itemChooser) {
		var self = observable(this),
			nouns, verbs, numSteps,
			exclusions = {},
			isBlank = function (s) {
				return _.isEmpty(s) || s.trim().length === 0;
			},
			randomChooser = function (arr) {
				return arr[Math.floor(Math.random() * arr.length)];
			},
			availableVerbsFor = function (noun) {
				if (exclusions[noun]) {
					return _.difference(verbs, _.keys(exclusions[noun]));
				}
				return verbs;
			},
			noAvailableVerbs = function (noun) {
				return _.isEmpty(availableVerbsFor(noun));
			},
			generate = function () {
				var result = [], noun, verb, index, availableNouns;
				if (!numSteps) {
					return false;
				}
				availableNouns = _.reject(nouns, noAvailableVerbs);
				if (_.isEmpty(availableNouns)) {
					return false;
				}
				for (index = 0; index < numSteps; index++) {
					noun = itemChooser(availableNouns);

					verb = itemChooser(availableVerbsFor(noun));
					result.push({'verb': verb, 'noun':	noun});
				}
				return result;
			},
			parseList = function (argList) {
				if(typeof(argList)==='string') {
					argList = argList.split('\n');
				}
				return _.unique(_.reject(argList, isBlank));
			};

			itemChooser = itemChooser || randomChooser;
			self.markNonsense = function (step) {
				if (!exclusions[step.noun]) {
					exclusions[step.noun] = {};
				}
				exclusions[step.noun][step.verb] = true;
			};
			self.markNotNonsense = function (step) {
				if (exclusions && exclusions[step.noun]) {
					delete exclusions[step.noun][step.verb];
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
				if (_.isEmpty(exclusions)) {
					return [];
				}
				var result = [];
				_.each(_.keys(exclusions).sort(), function (noun) {
					_.each(_.keys(exclusions[noun]).sort(), function (verb) {
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
		};
	window.Q3 = window.Q3 || {};
	window.Q3.ScenarioModel = ScenarioModel;
})();

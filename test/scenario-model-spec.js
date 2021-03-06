/*global jasmine, describe, it, expect, beforeEach, Q3 */
describe('Scenario Model', function () {
	'use strict';
  var underTest, itemChooser, nextRandomIndex, scenarioListener, randomIndexes;
  beforeEach(function() {
    nextRandomIndex = 0;
    itemChooser = jasmine.createSpy('itemChooser');
    itemChooser.and.callFake(function(arr) {
      return arr[randomIndexes[nextRandomIndex++]];
    });
    scenarioListener = jasmine.createSpy('scenarioListener');
    underTest = new Q3.ScenarioModel(itemChooser);
    underTest.addEventListener('scenarioGenerated', scenarioListener);
    randomIndexes = [0,1,2,3,4,5,6,7,8,9,10];
  });
  describe('nextScenario', function () {
		beforeEach(function () {
      underTest.setNouns(['Book', 'Article', 'Disk']);
      underTest.setVerbs(['Delete', 'Write', 'Burn']);
      underTest.setNumSteps(2);
      randomIndexes = [0, 2, 2, 0];
		});
    it('generates a scenario using a random noun and a random verb, with the specified number of steps', function () {
      var result = underTest.nextScenario();

			expect(result).toBeTruthy();
      expect(scenarioListener).toHaveBeenCalledWith([{noun:'Book', verb: 'Burn'}, {noun: 'Disk', verb:'Delete'}]);
    });
		it('returns false and does not trigger a scenarioGenerated event if there are no nouns', function () {
			underTest.setNouns([]);
      var result = underTest.nextScenario();

			expect(result).toBeFalsy();
      expect(scenarioListener).not.toHaveBeenCalled();
		});
		it('returns false and does not trigger a scenarioGenerated event if there are no verbs', function () {
			underTest.setVerbs([]);
      var result = underTest.nextScenario();

			expect(result).toBeFalsy();
      expect(scenarioListener).not.toHaveBeenCalled();
		});
		it('returns false and does not trigger a scenarioGenerated event for 0 steps', function () {
			underTest.setNumSteps(0);
      var result = underTest.nextScenario();

			expect(result).toBeFalsy();
      expect(scenarioListener).not.toHaveBeenCalled();
		});
		it('returns false and does not trigger a scenarioGenerated event if there are no steps', function () {
			underTest.setNumSteps(undefined);
      var result = underTest.nextScenario();

			expect(result).toBeFalsy();
      expect(scenarioListener).not.toHaveBeenCalled();
		});
		describe('nonsense exclusions', function () {
			beforeEach(function () {
				underTest.setNouns(['Book', 'Article', 'Disk', 'Stick']);
				underTest.setVerbs(['Delete', 'Write', 'Burn', 'Throw Away']);
				underTest.setNumSteps(1);
				randomIndexes = [0, 2];
			});
			it('skips over excluded verbs for a noun', function () {
				underTest.markNonsense({verb: 'Burn', noun: 'Book'});
				underTest.nextScenario();
				expect(itemChooser).toHaveBeenCalledWith(['Delete', 'Write', 'Throw Away']);
				underTest.nextScenario();
				expect(scenarioListener).toHaveBeenCalledWith([{noun:'Book', verb: 'Throw Away'}]);
			});
			it('skips over nouns for which all verbs are excluded', function () {
				underTest.markNonsense({verb: 'Burn', noun: 'Book'});
				underTest.markNonsense({verb: 'Write', noun: 'Book'});
				underTest.markNonsense({verb: 'Delete', noun: 'Book'});
				underTest.markNonsense({verb: 'Throw Away', noun: 'Book'});
				underTest.nextScenario();

				expect(itemChooser).toHaveBeenCalledWith(['Delete', 'Write', 'Burn', 'Throw Away']);
				underTest.nextScenario();
				expect(scenarioListener).toHaveBeenCalledWith([{noun:'Article', verb: 'Burn'}]);
			});
		});
  });
	describe('selectionMode', function () {
		beforeEach(function () {
      underTest.setNouns(['Book', 'Article', 'Disk']);
      underTest.setVerbs(['Delete', 'Write']);
      underTest.setNumSteps(3);
      randomIndexes = [0, 0, 0, 0, 0, 0];
		});
		it('does not prevent repetition if set to ALLOW_REPETITION', function () {
			underTest.setRepetitionMode(Q3.ScenarioModel.ALLOW_REPETITION);
			underTest.nextScenario();
			expect(scenarioListener).toHaveBeenCalledWith([{noun:'Book', verb: 'Delete'}, {noun: 'Book', verb: 'Delete'}, {noun:'Book', verb:'Delete'}]);
		});
		it('ensures steps do not repeat in the entire scenario if set to UNIQUE_STEPS', function () {
			underTest.setRepetitionMode(Q3.ScenarioModel.UNIQUE_STEPS);
			underTest.nextScenario();
			expect(scenarioListener).toHaveBeenCalledWith([{noun:'Book', verb: 'Delete'}, {noun: 'Book', verb: 'Write'}, {noun:'Article', verb:'Delete'}]);
		});
		it('allows same step but not in sequence if set to NO_SEQUENCE', function () {
			underTest.setRepetitionMode(Q3.ScenarioModel.NO_SEQUENCE);
			underTest.nextScenario();
			expect(scenarioListener).toHaveBeenCalledWith([{noun:'Book', verb: 'Delete'}, {noun: 'Book', verb: 'Write'}, {noun:'Book', verb:'Delete'}]);
		});
	});
	describe('setNouns', function () {
		it('sets an array of nouns', function () {
			underTest.setNouns(['Book', 'Article', 'Disk']);
			expect(underTest.getNouns()).toEqual(['Book', 'Article', 'Disk']);
		});
		it('ignores empty nouns', function () {
			underTest.setNouns(['Book', ' ', '', 'Disk']);
			expect(underTest.getNouns()).toEqual(['Book', 'Disk']);
		});
		it('ignores duplicated nouns', function () {
			underTest.setNouns(['Book', 'Book', 'Disk']);
			expect(underTest.getNouns()).toEqual(['Book', 'Disk']);
		});
		it('sets a list of new-line separated items', function () {
			underTest.setNouns('Book\nArticle\nDisk');
			expect(underTest.getNouns()).toEqual(['Book', 'Article', 'Disk']);
		});
		it('ignores empty items when setting from a string', function () {
			underTest.setNouns('\nBook\n  \nArticle\nDisk\n');
			expect(underTest.getNouns()).toEqual(['Book', 'Article', 'Disk']);
		});
	});
	describe('setVerbs', function () {
		it('sets an array of verbs', function () {
			underTest.setVerbs(['Burn', 'Turn', 'Spin']);
			expect(underTest.getVerbs()).toEqual(['Burn', 'Turn', 'Spin']);
		});
		it('ignores empty verbs', function () {
			underTest.setVerbs(['Burn', ' ', '', 'Spin']);
			expect(underTest.getVerbs()).toEqual(['Burn', 'Spin']);
		});
		it('ignores duplicated verbs', function () {
			underTest.setVerbs(['Burn', 'Burn', 'Spin']);
			expect(underTest.getVerbs()).toEqual(['Burn', 'Spin']);
		});
		it('sets a list of new-line separated items', function () {
			underTest.setVerbs('Burn\nTurn\nSpin');
			expect(underTest.getVerbs()).toEqual(['Burn', 'Turn', 'Spin']);
		});
		it('ignores empty items when setting from a string', function () {
			underTest.setVerbs('\nBurn\n  \nTurn\nSpin\n');
			expect(underTest.getVerbs()).toEqual(['Burn', 'Turn', 'Spin']);
		});
	});
	describe('markNonsense', function () {
		beforeEach(function () {
      underTest.setNouns(['Book', 'Article', 'Disk']);
      underTest.setVerbs(['Delete', 'Write', 'Burn']);
		});
		it('adds a nonsense combination to the list, sorted alphabetically by noun and verb', function () {
			underTest.markNonsense({verb:'Burn', noun: 'Book'});
			underTest.markNonsense({verb:'Burn', noun: 'Article'});
			underTest.markNonsense({verb:'Delete', noun: 'Book'});
			expect(underTest.getExclusions()).toEqual([{noun:'Article', verb:'Burn'}, {noun:'Book', verb: 'Burn'}, {noun: 'Book', verb: 'Delete'}]);
		});
	});
	describe('markNotNonsense', function () {
		beforeEach(function () {
      underTest.setNouns(['Book', 'Article', 'Disk']);
      underTest.setVerbs(['Delete', 'Write', 'Burn']);
			underTest.markNonsense({verb:'Burn', noun: 'Book'});
			underTest.markNonsense({verb:'Burn', noun: 'Article'});
			underTest.markNonsense({verb:'Delete', noun: 'Book'});
		});
		it('removes a combination from the exclusion list', function () {
			underTest.markNotNonsense({verb:'Burn', noun: 'Article'});
			expect(underTest.getExclusions()).toEqual([{noun:'Book', verb: 'Burn'}, {noun: 'Book', verb: 'Delete'}]);
		});
	});
});

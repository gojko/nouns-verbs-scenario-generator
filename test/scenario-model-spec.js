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
});

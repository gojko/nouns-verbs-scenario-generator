/* global jQuery, _ */
jQuery.fn.scenarioWidget = function (scenarioModel) {
	'use strict';
	var element = jQuery(this),
			templateParent,
			template;
	template = element.find('[data-role=template]');
	templateParent = template.parent();
	template.detach();
	scenarioModel.addEventListener('scenarioGenerated', function (scenario) {
		templateParent.empty();
		var index = 1;
		_.each(scenario, function (step) {
			var item = template.clone().appendTo(templateParent),
			nonsense = function () {
				item.find('[data-role=step]').addClass('danger');
				item.find('[data-role=nonsense]').hide();
				item.find('[data-role=restore]').show();
				scenarioModel.markNonsense(step);
			},
			restore = function () {
				item.find('[data-role=step]').removeClass('danger');
				item.find('[data-role=restore]').hide();
				item.find('[data-role=nonsense]').show();
				scenarioModel.markNotNonsense(step);
			};
		item.find('[data-role=step]').text(step.verb +  ' ' + step.noun);
		item.find('[data-role=index]').text(index);
		item.find('[data-role=nonsense]').click(nonsense);
		item.find('[data-role=restore]').hide().click(restore);
		index++;
		});
	});
};


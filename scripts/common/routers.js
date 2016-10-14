define([
	'../pages/main/router',
	'../pages/dashboard/router',
	'../pages/appManage/router',
	'../pages/rbdManage/router',
	'../pages/costManage/router',
	'../pages/extensions/router',
	'../pages/imageManage/router',
	'../pages/topology/router',
	'../pages/appManage/deployment/router',
	'../pages/appManage/history/router',
	'../pages/organizManage/router'
		], function(mainRouter, dashboardRouter, appManageRouter, rbdManageRouter, costManageRouter, extensionsRouter, imageManageRouter, topologyRouter, deploymentRouter, historyRouter, organizManageRouter){

		'use strict';

		var init = function(app){
			app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider){
				$urlRouterProvider.otherwise("/login");

				$stateProvider
					.state('login', mainRouter.login)
					.state('main', mainRouter.main)
					.state('main.dashboard', dashboardRouter.dashboard)
					.state('main.appManage', appManageRouter.appManage)
					.state('main.appManageDeployment', deploymentRouter.deployment)
					.state('main.appManageHistory', historyRouter.history)
					.state('main.rbdManage', rbdManageRouter.rbdManage)
					.state('main.costManage', costManageRouter.costManage)
					.state('main.extensions', extensionsRouter.extensions)
					.state('main.extensionsService', extensionsRouter.service)
					.state('main.extensionsEndpoint', extensionsRouter.endpoint)
					.state('main.imageManage', imageManageRouter.imageManage)
					.state('main.imageManageBase', imageManageRouter.base)
					.state('main.imageManageSearch', imageManageRouter.search)
					.state('main.imageManageDelete', imageManageRouter.delete)
					.state('main.topology', topologyRouter.topology)
					//.state('main.organizManage', organizManageRouter.organizManage)
			}]);
		};

		return {
			init: init
		};	
	}
);
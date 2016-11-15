define([
	'utils'
	], function(utils){
	'use strict';

	var getApis = function($http){
		var apis = {};


		apis.createTemplate = function (param, success, error){
			return utils.http($http, 'post', '/api/v1/organizations/'+param.orgId+'/users/'+param.userId+'/templates/new', param, success, error);
		};

		apis.templateNameExit = function (param, success, error){
			return utils.http($http, 'post', '/api/v1/organizations/'+param.orgId+'/users/'+param.userId+'/templates/check', param, success, error);
		};




		

		return apis;
	};	

	var services = {
		module: 'template',
		name: 'templateService',
		getApis: getApis
	};

	return services;
});
/**
 * Created by Jora on 2016/7/29.
 */
define([
        'base64'
    ], function(Base64){
        'use strict';

        var ctrl = ['$scope', '$rootScope', 'appManageService', '$localStorage', '$http', function($scope, $rootScope, appManageService, $localStorage, $http){
            $scope.canSubmit = true;
            $scope.param = {"orgId": $localStorage.orgId, "userId": $localStorage.userId, "sessionId": $localStorage.sessionId};

            $scope.loadAppList = function(){
                appManageService.getAppList($scope.param,function(data){
                    if (data.code == 0) {
                       $scope.appList = JSON.parse(data.data);
                    }
                });
            };
            $scope.loadAppList();

            // 发布详情
            $scope.showAppDeployDetail = function(item){
                $scope.appDeployDetailConf = {
                    widgetId : 'widgetAppDeployDetail',
                    widgetTitle : '发布详情',
                    isAppDeployDetail : true,
                    data : item
                };
                $rootScope.widget.widgetAppDeployDetail = true;
            };


            // 应用实例详情
            $scope.showAppPodDetail = function(item){
                $scope.appPodDetailConf = {
                    widgetId : 'widgetAppPodDetail',
                    widgetTitle : '应用实例详情',
                    isAppPodDetail : true,
                    data : item
                };
                $rootScope.widget.widgetAppPodDetail = true;
            };

            // 滚动升级
            $scope.rollingup = function(item, dcId, dcName){
                item.dcId = dcId;
                item.dcName = dcName;
                $scope.appRollingupConf = {
                    widgetId : 'widgetRollingup',
                    widgetTitle : '升级',
                    isRollingup: true,
                    data : item
                };

                $rootScope.widget.widgetRollingup = true;
            };

            $scope.$on('submitRollingup',function(event,param){
                param = angular.merge(param, $scope.param);
                if($scope.canSubmit){
                    $scope.canSubmit = false;
                    appManageService.submitRollingup(param,function(data){
                        console.log(data);
                        $rootScope.widget.widgetRollingup = false;
                        $scope.loadAppList();
                        $scope.canSubmit = true;
                    },function(){
                        $scope.canSubmit = true;
                    });
                }
            });



            // 回滚
            $scope.rollback = function(item, dcId, appName){
                $scope.appRollbackConf = {
                    widgetId : 'widgetRollback',
                    widgetTitle : '回滚',
                    isRollback: true,
                    data : item
                };

                $rootScope.widget.widgetRollback = true;

                // 查看回滚历史
                appManageService.getRollbackHistory({
                    sessionId: $localStorage.sessionId,
                    orgId: $localStorage.orgId,
                    dcId: dcId,
                    appName: item.deploy.metadata.name
                }, function(data){
                    if(data.code == 0){
                        $scope.history = JSON.parse(data.data);
                        $scope.appRollbackConf.history = JSON.parse(data.data);
                        $scope.dcId = dcId;
                        $scope.appName = appName;
                        $scope.$broadcast('rollbackHistory', $scope.history);
                        $scope.$broadcast('rollbackDcId', $scope.dcId);
                        $scope.$broadcast('rollbackAppName', $scope.appName);
                    }
                });
            };

            $scope.$on('submitRollback',function(event, param, dcId, appName){
                param = angular.merge(param, $scope.param);
                param.dcId = dcId;
                param.appName = appName;
                if($scope.canSubmit){
                    $scope.canSubmit = false;
                    appManageService.submitRollback(param,function(data){
                        $rootScope.widget.widgetRollback = false;
                        $scope.loadAppList();
                        $scope.canSubmit = true;
                    },function(){
                        $scope.canSubmit = true;
                    });
                }
            });

            // 扩容
            $scope.scale = function(item, dcId, appName){
                $scope.param.dcId = dcId;
                $scope.param.appName = appName;
                $scope.param.sessionId = $localStorage.sessionId;

                $scope.appScaleConf = {
                    widgetId : 'widgetScale',
                    widgetTitle : '扩容',
                    isScale: true,
                    data : item
                };

                $rootScope.widget.widgetScale = true;
            };
            $scope.$on('submitScale',function(event,param){
                param = angular.merge(param, $scope.param);
                console.log(param);

                if($scope.canSubmit){
                    $scope.canSubmit = false;
                    appManageService.submitScale(param,function(data){
                        console.log(data);
                        $rootScope.widget.widgetRollingup = false;
                        $scope.loadAppList();
                        $scope.canSubmit = true;
                    },function(){
                        $scope.canSubmit = true;
                    });
                }
            });

            /*选择镜像*/
            $scope.$on('showImageSelector',function(event, data){
                $scope.imageSelectorConf = {
                    widgetId : 'widgetImageSelector',
                    widgetTitle : '选择镜像',
                    isImageSelector: true
                };
                $rootScope.widget.widgetImageSelector = true;
                $scope.currentWidget = data;
            });
            $scope.$on('imageSelector',function(event, data){
                /*由于镜像选择弹窗与回滚,滚动升级弹窗是同级,镜像选择的值要传递回来,
                需要先从imageSelector页面传递到父页面(deployment.html或者appManage.html),
                然后再由appManage.html传递给回滚和滚动升级页面*/
                switch($scope.currentWidget){
                    case 'rollingup':
                        $scope.$broadcast('rollingupImage',data);
                        break;
                    case 'rollback':
                        $scope.$broadcast('rollbackImage',data);
                        break;
                }
                $rootScope.widget.widgetImageSelector = false;


            });
        }];


        var controllers = [
            {module: 'appManage', name: 'appManageController', ctrl: ctrl}
        ];

        return controllers;
    }
);
'use strict';

// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('myApp', [
	'ng-admin'
]);

myApp.config(['RestangularProvider', function(RestangularProvider) {
    // CORS
    RestangularProvider.setDefaultHeaders({'Access-Control-Allow-Origin': '* '});
    // REST API params
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
        if (operation == "getList") {
            // custom pagination params
            if (params._page) {
                params._start = (params._page - 1) * params._perPage;
                params._end = params._page * params._perPage;
            }
            delete params._page;
            delete params._perPage;
            // custom sort params
            if (params._sortField) {
                params._sort = params._sortField;
                params._order = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }
            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }
        }
        return { params: params };
    });
}]);

// declare a function to run when the module bootstraps (during the 'config' phase)
myApp.config(['NgAdminConfigurationProvider', function (nga) {
     // create an admin application
    var admin = nga.application('ng-admin Sample App')
    /*  .baseApiUrl('http://kidscorp-admin.localhost/kidscorp-admin-api/public/api/'); // main API endpoint*/
     .baseApiUrl('http://jsonplaceholder.typicode.com/'); // main API endpoint
    
    // create entities
    // the API endpoint for this entities will be 'http://jsonplaceholder.typicode.com/entity/:id
    var user = nga.entity('users');
    var comment = nga.entity('comments');
    var post = nga.entity('posts');

    user.listView()
    	.fields([
	    	nga.field('id').isDetailLink(true),,
	        nga.field('name'),
	        nga.field('username'),
	        nga.field('email')
	    ])
	    .listActions(['show', 'edit', 'delete']); //action icons
    user.creationView().fields([
	    nga.field('name').validation({ required: true, minlength: 3, maxlength: 100 }),
	    nga.field('username') .attributes({ placeholder: 'No space allowed, 5 chars min' })
        	.validation({ required: true, pattern: '[A-Za-z0-9\.\-_]{5,20}' }),
	    nga.field('email', 'email'),
	    nga.field('address.street').label('Street'),
	    nga.field('address.city').label('City'),
	    nga.field('address.zipcode').label('Zipcode'),
	    nga.field('phone'),
	    nga.field('website')
	]);
	user.editionView().fields(user.creationView().fields());

    comment.listView().fields([
        nga.field('id').isDetailLink(true),,
        nga.field('name'),
        nga.field('email'),
        nga.field('body'),
        nga.field('postId', 'reference')
	        .targetEntity(post)
	        .targetField(nga.field('id'))
	        .label('Post')
    ]);
	
    post.listView()
    	.fields([
	        nga.field('id').isDetailLink(true),
	        nga.field('title'),
		    nga.field('body', 'text')
		        .map(function truncate(value) {
		            if (!value) return '';
		            return value.length > 50 ? value.substr(0, 50) + '...' : value;
		    	}),
	        nga.field('userId', 'reference')
		        .targetEntity(user)
		        .targetField(nga.field('username'))
		        .label('User')
	    ])
    	.listActions(['show']) //action icon
		.batchActions([]) //remove multiple select
    	.filters([
	        nga.field('q')
	            .label('')
	            .pinned(true)
	            .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
	        nga.field('userId', 'reference')
	            .targetEntity(user)
	            .targetField(nga.field('username'))
	            .label('User')
	    ]);
    post.showView()
    	.fields([
		    nga.field('title'),
		    nga.field('body', 'text'),
		    nga.field('userId', 'reference')
		        .targetEntity(user)
		        .targetField(nga.field('username'))
		        .label('User'),
		    nga.field('comments', 'referenced_list')
		        .targetEntity(nga.entity('comments'))
		        .targetReferenceField('postId')
		        .targetFields([
		            nga.field('email'),
		            nga.field('name')
		        ])
		        .sortField('id')
		        .sortDir('DESC'),
		]);
	post.readOnly(); //read only entity (remove delete. create or edit options)
    
    // add entities
    admin.addEntity(user);
    admin.addEntity(comment);
    admin.addEntity(post);

//Customizing the Sidebar Menu
    admin.menu(nga.menu()
	    .addChild(nga.menu(user).icon('<span class="glyphicon glyphicon-user"></span>'))
	    .addChild(nga.menu().title('Items')
	    	.addChild(nga.menu(post).icon('<span class="glyphicon glyphicon-pencil"></span>'))
	    	.addChild(nga.menu(comment).icon('<span class="glyphicon glyphicon-triangle-right"></span>'))
	   	)
	);

    // attach the admin application to the DOM and execute it
    nga.configure(admin);
}]);
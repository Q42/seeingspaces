Router.route "/", (-> @render "controlSurface"), fastRender: yes
Router.route "/screen:num", (-> @render "screen#{@params.num}"), fastRender: yes

if Meteor.isClient

  Template.controlSurface.helpers
    screen: -> [1,2,3,4]

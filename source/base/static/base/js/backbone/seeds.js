(function(exports){

  var Seeds = Backbone.Model.extend({
    urlRoot: "/api/seeds_list/",
    defaults: {
      seeds: "",
      name: "",
      slug: "",
    }
  });


  var SeedsCollection = Backbone.Collection.extend({
    url: "/api/seeds_list/",
    model: Seeds,
  });


  var SeedsView = Backbone.View.extend({
    el: "#seeds",
    template: _.template($("#seedsItem").html()),
    initialize: function(model){
      this.model = model;
      _.bindAll(this, 'render');
      var that = this;
      this.modelObject = this.model.toJSON();
      this.deleteId = "#delete_seeds_" + this.modelObject.id
      // Reset events each time so backbone doesnt clump events together.
      this.events = {};
      this.events["submit " + this.deleteId] = "deleteSeeds"
      this.render();
    },
    render: function(){
      this.$el.append(this.template(this.model.toJSON()));
    },
    deleteSeeds: function(event){
      event.preventDefault();
      var confirmDelete = confirm("Are you sure you want to delete this crawl model?")
      if (confirmDelete == true){
        $.ajax({
          method: "DELETE",
          url: "/api/seeds_list/" + this.model.id + "/",
          success: function(response){
            window.location.reload();
          },
          error: function(response, xhr, thrownError){
            errorString = "";
            errors = response.responseJSON;
            _.each(errors.errors, function(error){
              errorString += ("\n\t" + error);
            })
            alert(errors.message + errorString);
          },
        });
      }
    },
  });


  var SeedsCollectionView = BaseViews.CollectionView.extend({
    modelView: SeedsView,
  });


  var AddSeedsView = BaseViews.FormView.extend({
    el: "#addSeedsContainer",
    modal: "#newSeedsModal",
    form: "#addSeedsForm",
    filesField: "#id_seeds",
    formFields: [
      "name",
      "seeds",
    ],
    template: _.template($("#addSeedsTemplate").html()),
    initialize: function(collection){
      this.collection = collection;
      this.render();
    },
    render: function(){
      this.$el.html(this.template());
    },
    addSeeds: function(event){
      var that = this;
      event.preventDefault();
      var formObjects = this.toFormData(this.form);
      // Attach the contents of the file to the FormData object.
      var file = $(this.filesField)[0].files[0];
      if (typeof file != 'undefined'){
        formObjects.append("seeds", file, file.name);
      }
      var newSeeds = new Seeds(formObjects);
      this.collection.add(newSeeds);
      // If model.save() is successful, clear the errors and the form, and hide
      // the modal. If model.save() had errors, show each error on form field,
      // along with the content of the error.
      newSeeds.save({}, {
        data: formObjects,
        contentType: false,
        success: function(response){
          var newSeeds = new SeedsView(
            that.collection.models[that.collection.models.length - 1]
          );
          that.formSuccess(that.modal, that.form);
          that.clearErrors(that.formFields, that.form);
        },
        error: function(model, xhr, thrownError){
          that.showFormErrors(xhr.responseJSON, that.form);
        },
      });
    },
    events: {
      "submit #addSeedsForm": "addSeeds",
    },
  });


  var SeedsRouter = Backbone.Router.extend({
    routes: {
      "": "index",
    },
    index: function(){
      var seedsCollection = new SeedsCollection();
      var seedsCollectionView = new SeedsCollectionView(seedsCollection);
      var addSeedsView = new AddSeedsView(seedsCollection);
    },
  });


  $(document).ready(function(){
    var appRouter = new SeedsRouter();
    Backbone.history.start();
  });

})(this.Seeds = {});

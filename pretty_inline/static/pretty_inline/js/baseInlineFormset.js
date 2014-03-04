var InlineFormset = {};

(function ($, window) {
    "use strict";
    var pluginName = "baseInlineFormset",
        defaults = {
            maximumForms: null,
            initialForms: null,
            totalForms: null,
            emptyForm: null,
            formsContainer: null,
            editorContainer: null,

            prefix: null,
            adminStaticPrefix: null,
            addText: null,
            deleteText: null,
            undeleteText: null,
            cantUndeleteText: null,

            addButton: null
        };

    function Plugin(element, options, extend) {
        this.element = element;
        this.$element = $(this.element);
        this.settings = $.extend({}, defaults, options);
//        this._defaults = defaults;
//        this._name = pluginName;
        if( !extend ) {
            this.init();
        }
    }

    Plugin.prototype = {
        isEditorOpen: false,

        init: function () {
            this.initPrefix();
            this.initInlineConstraints();
            this.initTextLabels();
            this.initEmptyForm();
            this.initFormsContainer();
            this.initEditorContainer();
            this.initChangeForm();
            this.initListeners();

            this.renderControls();

            this.bindToForm();
        },

        initPrefix: function () {
            var inlineId = this.$element.attr('id');
            this.settings.prefix = inlineId.replace("-group", "");
        },
        initInlineConstraints: function () {
            var idPrefix = "#id_" + this.settings.prefix;
            this.settings.totalForms = parseInt(this.$element.find(idPrefix + "-TOTAL_FORMS").val(), 10);
            this.settings.initialForms = parseInt(this.$element.find(idPrefix + "-INITIAL_FORMS").val(), 10);
            this.settings.maximumForms = parseInt(this.$element.find(idPrefix + "-MAX_NUM_FORMS").val(), 10);
        },

        initEmptyForm: function () {
            this.settings.emptyForm = this.$element.find(".empty-form");
        },

        initFormsContainer: function () {
            this.settings.formsContainer = this.settings.emptyForm.parent();
        },

        initEditorContainer: function () {
            this.settings.editorContainer = this.$element.find(".editor");
        },

        initTextLabels: function () {
            this.settings.addText = this.$element.find(".add-text").text();
            this.settings.changeText = this.$element.find(".change-text").text();
            this.settings.deleteText = this.$element.find(".delete-text").text();
            this.settings.undeleteText = this.$element.find(".undelete-text").text();
            this.settings.canUndeleteText = this.$element.find(".cant-undelete-text").text();
        },

        initChangeForm: function () {
            this.settings.itemLabelField = this.$element.find(".item-label-field").text();
        },

        initListeners: function () {
            var that = this;
            this.$element.on("formAdded", function () {
                that.updateAddVisibility();
            });
            this.$element.on("formRemoved", function () {
                that.updateAddVisibility();
            });
        },

        renderControls: function () {
            this.renderAddButton();
            this.renderDeleteButtons();
            this.renderChangeButtons();
        },

        renderAddButton: function () {
            var that = this;
            this.addButton = $('<button type="button"></button>')
                .text(this.settings.addText)
                .addClass("add-button")
                .click(function (event) {
                    that.addForm(event);
                });

            this.$element.append(this.addButton);
        },

        renderChangeButtons: function () {
            var that = this;
            this.settings
                .formsContainer
                .children(":not(.empty-form)")
                .each(function () {
                    that.replaceChangeSectionToForm($(this));
                });
        },

        renderDeleteButtons: function () {
            var that = this;
            this.settings
                .formsContainer
                .children(":not(.empty-form)")
                .each(function () {
                    that.replaceDeleteSectionToForm($(this));
                });
        },

        bindToForm: function () {
            var that = this;
            this.$element.parents("form").on("submit", function (event) {
                that.prepareForSubmit(event);
            });
        },

        replaceChangeSectionToForm: function (formElement) {
            var that = this,
                button = $('<button type="button"></button>');

            button
                .text(this.settings.changeText)
                .addClass("change-button")
                .click(function () {
                    that.showChangeForm(formElement);
                });

            formElement
                .find(".change")
                .html("")
                .append(button);
        },

        replaceDeleteSectionToForm: function (formElement) {
            var that = this,
                button = $('<button type="button"></button>'),
                checkbox = $('<input type="checkbox">');

            button
                .text(this.settings.deleteText)
                .addClass("delete-button")
                .click(function () {
                    that.removeForm(formElement);
                });

            checkbox
                .attr('name', this.settings.prefix + '-__prefix__-DELETE')
                .hide();

            formElement
                .find(".delete")
                .html("")
                .append(button)
                .append(checkbox);
        },

        canAddAnotherForm: function () {
            var valid = true;
            valid = valid && (this.settings.totalForms < this.settings.maximumForms);
            return valid;
        },

        addForm: function () {
            if (!this.canAddAnotherForm()) {
                return;
            }

            var newForm = this.appendForm();
            this.increaseFormCount();
            this.$element.trigger("formAdded", newForm);

            this.showChangeForm(newForm);
        },

        showChangeForm: function (formElement) {
            var changeForm = formElement.find(".change-form").clone(),
                saveButton = $('<button type="button">Save</button>'),
                cancelButton = $('<button type="button">Cancel</button>'),
                buttonRow = $('<div></div>');

            var that = this;

            saveButton
                .addClass("save-button")
                .on("click", function() {
                    that.saveChangeForm(formElement);
                });

            cancelButton
                .addClass("cancel-button")
                .on("click", function() {
                that.cancelChangeForm(formElement);
            });

            buttonRow
                .addClass("button-row")
                .append(saveButton)
                .append(cancelButton);

            changeForm.removeClass("hidden")

            this.settings.editorContainer
                .html("")
                .append(changeForm)
                .append(buttonRow)
                .data('form-element', formElement);

            this.isEditorOpen = true;
            this.$element.addClass("editor-active");
        },

        saveChangeForm: function (formElement) {
            var form = this.settings.editorContainer.find(".change-form");

            form.addClass("hidden");
            formElement
                .find('.change-form')
                .replaceWith(form)
                .addClass("hidden");

            this.updateItemLabel(form);
            this.closeChangeForm();
        },

        cancelChangeForm: function (formElement) {
            this.closeChangeForm();
        },

        closeChangeForm: function () {
            this.settings.editorContainer.html("");
            this.isEditorOpen = false;
            this.$element.removeClass("editor-active");
        },

        updateItemLabel: function (form) {
            var itemLabel, labelText;

            itemLabel = form
                .parents(".item")
                .find(".item-label");

            labelText = form
                .find(".field-" + this.settings.itemLabelField)
                .find("input,select,textarea")
                .val();

            itemLabel.text(labelText);
        },

        hasFormChange: function(formElement) {
            var currentValues = formElement.find('input,select,textarea'),
                startValues = this.settings.emptyForm.find('input,select,textarea'),
                equal = true;

            $.each(startValues, function(i, field) {
                equal = equal && $(currentValues[i]).val() === $(field).val();
            });

            return !equal;
        },

        removeForm: function (formElement) {
            var that = this;

            if( this.hasFormChange(formElement) ) {
                formElement.addClass("removed");

                formElement
                    .find(".delete input[type=checkbox]")
                    .attr("checked", true);

                formElement
                    .find(".delete button")
                    .text(this.settings.undeleteText)
                    .unbind()
                    .click(function () {
                        that.unRemoveForm(formElement);
                    });
            } else {
                formElement.remove();
            }


            this.decreaseFormCount();
            this.$element.trigger("formRemoved", formElement);
        },

        unRemoveForm: function (formElement) {
            if (!this.canAddAnotherForm()) {
                window.alert(this.settings.canUndeleteText);
                return;
            }
            var that = this;

            formElement.removeClass("removed");

            formElement
                .find(".delete input[type=checkbox]")
                .attr("checked", true);

            formElement
                .find(".delete button")
                .text(this.settings.deleteText)
                .unbind()
                .click(function () {
                    that.removeForm(formElement);
                });

            this.increaseFormCount();
            this.$element.trigger("formAdded", formElement);
        },

        appendForm: function () {
            var newForm = this.cloneEmptyForm();
            this.settings.emptyForm.before(newForm);
            return newForm;
        },

        increaseFormCount: function () {
            this.settings.totalForms += 1;
        },

        decreaseFormCount: function () {
            this.settings.totalForms -= 1;
        },

        cloneEmptyForm: function () {
            var form = this.settings.emptyForm.clone();
            form.removeClass("empty-form");
            this.replaceDeleteSectionToForm(form);
            this.replaceChangeSectionToForm(form);

            return form;
        },

        updateAddVisibility: function () {
            this.addButton
                .attr("disabled", !this.canAddAnotherForm())
                .toggleClass("disabled", !this.canAddAnotherForm());
        },

        handleOpenEditor: function (event){
            event.preventDefault();

            var fieldWithFocus = $("input:focus, select:focus, textarea:focus");

            if( fieldWithFocus.length && $.contains(this.settings.editorContainer[0], fieldWithFocus[0]) ) {
                this.saveChangeForm(this.settings.editorContainer.data('form-element'));
            } else {
                alert("Please save (or cancel) the active editor first");
            }


        },

        prepareForSubmit: function (event) {
            if( this.isEditorOpen ) {
                this.handleOpenEditor(event);
            }

            this.removeNewButDeletedForms();
            this.renumberFormIds();
        },

        removeNewButDeletedForms: function () {
            this.$element.find(".removed:not(.has_original)").remove();
        },

        renumberFormIds: function () {
            var that = this,
                index = 0;

            this.settings.formsContainer.children().each(function () {
                $(this).find('*').each(function () {
                    that.updateElementIndex(this, that.settings.prefix, index);
                });

                index += 1;
            });
        },

        updateElementIndex: function (el, prefix, index) {
            var id_regex = new RegExp("(" + prefix + "-(\\d+|__prefix__))"),
                replacement = prefix + "-" + index,
                $el = $(el);

            // If label
            if ($el.prop("for")) {
                $el.prop("for", $el.prop("for").replace(id_regex, replacement));
            }

            if ($el.attr('id')) {
                $el.attr('id', $el.attr('id').replace(id_regex, replacement));
            }

            if ($el.attr('name')) {
                $el.attr('name', $el.attr('name').replace(id_regex, replacement));
            }
        }
    };

    // Bind to global (namespaced) so we can extend it elsewhere
    InlineFormset['baseInlineFormset'] = Plugin;

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });

        // chain jQuery functions
        return this;
    };

    $(function () {
        $(".inline-group:not(.custom)").baseInlineFormset();
    });
})(django.jQuery, window);
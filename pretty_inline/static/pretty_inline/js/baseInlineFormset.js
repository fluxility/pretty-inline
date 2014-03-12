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
                that.reinitDateTimeShortCuts();
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

        disableChangeAndDelete: function (formElement) {
            formElement.find(".change-button, .delete-button")
                .prop("disabled", "disabled")
                .addClass("disabled");
        },

        enableChangeAndDelete: function (formElement) {
            formElement.find(".change-button, .delete-button")
                .prop("disabled", false)
                .removeClass("disabled");
        },

        showChangeForm: function (formElement) {
            var formRow = formElement.find(".form-row"),
                originalChangeForm = formElement.find(".change-form.original"),
                changeForm = originalChangeForm.clone(),
                saveButton = $('<button type="button">OK</button>'),
                cancelButton = $('<button type="button">Cancel</button>'),
                buttonRow = $('<div></div>');

            var that = this;

            this.unRemoveForm(formElement);

            formElement.find(".change-form.active").remove();

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


            changeForm.find("fieldset:last").append(buttonRow);

            changeForm
                .data('form-element', formElement)
                .insertAfter(originalChangeForm);

            changeForm.removeClass("original hidden");
            setTimeout(function(){changeForm.addClass("active")}, 1);


            this.isEditorOpen = true;
            this.disableChangeAndDelete(formElement);
            this.reinitDateTimeShortCuts();
        },

        saveChangeForm: function (formElement) {
            formElement.find(".change-form.original").remove();

            formElement
                .find('.change-form.active .button-row')
                .remove();

            formElement
                .find(".change-form.active")
                .removeClass("active")
                .addClass("original");


            this.updateItemLabel(formElement);
            this.closeChangeForm(formElement);
        },

        cancelChangeForm: function (formElement) {
            if( !this.isOriginalEqualToEmptyForm(formElement) ) {
                this.removeForm(formElement);
            }

            this.closeChangeForm(formElement);
        },

        closeChangeForm: function (formElement) {
            formElement
                .find(".change-form.active")
                .remove();

            this.isEditorOpen = false;
            this.enableChangeAndDelete(formElement);
            this.$element.removeClass("editor-active");
        },

        updateItemLabel: function (formElement) {
            var originalForm = formElement.find(".change-form.original");

            formElement.find(".form-row .representation-field")
                .each(function(){
                    var representationField, fieldName, fieldValue;

                    representationField = $(this);
                    fieldName = ".field-" + representationField.data('field');
                    fieldValue = originalForm
                        .find(
                            fieldName + " input," +
                            fieldName + " select," +
                            fieldName + " textarea"
                        )
                        .val();

                    representationField.text(fieldValue.substring(0, 30));
                });
        },

        isOriginalEqualToEmptyForm: function(formElement) {
            var currentValues, startValues, equal=true;

            currentValues = formElement
                    .find(
                        '.change-form.original input,' +
                        '.change-form.original select,' +
                        '.change-form.original textarea'
                    );

            startValues = this.settings.emptyForm
                    .find('input, select, textarea');

            $.each(startValues, function(i, field) {
                equal = equal && $(currentValues[i]).val() === $(field).val();
            });

            return !equal;
        },

        removeForm: function (formElement) {
            var that = this;

            if( this.isOriginalEqualToEmptyForm(formElement) ) {
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

            if(!formElement.hasClass("removed")) {
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

        /**
         * Check where the submit was fired from:
         *
         * 1. In an active form inside me
         * 2. In an active form in another inline
         * 3. Some where on the form
         *
         * Case 1: save this specific form
         * Case 2: let it go, owner will handle this one
         * Case 3: save all my open editors
         *
         * @param event
         */
        handleOpenEditors: function (event){
            var field = $("input:focus, select:focus, textarea:focus"),
                editor = field.parents(".change-form.active"),
                that = this;

            function inEditor() {
                return editor.length > 0 || ('wasInlineEditor' in event);
            }

            function inThisEditor() {
                return $.contains(that.element, editor[0] );
            }

            if( inEditor() ) {
                // Was in some editor (case 1 and 2)
                if( inThisEditor() ) {
                    // Was in my editor
                    that.saveChangeForm(editor.data("form-element"));
                    event['wasInlineEditor'] = true;
                    event.preventDefault();
                }
            } else {
                // Had nothing to do with editors (case 3)
                this.saveAllOpenEditors(event);
            }
        },

        saveAllOpenEditors: function (event) {
            var that = this;
            this.$element.find(".change-form.active").each(function(){
                that.saveChangeForm($(this).data("form-element"));
            })
        },

        prepareForSubmit: function (event) {
            this.handleOpenEditors(event);

            this.removeNewButDeletedForms();
            this.renumberFormIds();
            this.updateManagementForm();
        },

        updateManagementForm: function () {
            var idPrefix = "#id_" + this.settings.prefix;
            this.$element.find(idPrefix + "-TOTAL_FORMS").val(this.settings.totalForms);

        },

        removeNewButDeletedForms: function () {
            this.$element.find(".removed:not(.has_original)").remove();
        },

        renumberFormIds: function () {
            var that = this,
                index = 0;

            this.settings.formsContainer.find('.change-form').each(function () {
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
        },

        reinitDateTimeShortCuts: function() {
            // Reinitialize the calendar and clock widgets by force, yuck.
            if (typeof DateTimeShortcuts != "undefined") {
                $(".datetimeshortcuts").remove();
                DateTimeShortcuts.init();
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
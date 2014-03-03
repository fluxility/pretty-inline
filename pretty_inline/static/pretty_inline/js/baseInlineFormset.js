(function ($, window) {
    "use strict";
    var pluginName = "baseInlineFormset",
        defaults = {
            maximumForms: null,
            initialForms: null,
            totalForms: null,
            emptyForm: null,
            formsContainer: null,

            prefix: null,
            adminStaticPrefix: null,
            addText: null,
            deleteText: null,
            undeleteText: null,

            addButton: null
        };

    function Plugin(element, options) {
        this.element = element;
        this.$element = $(this.element);
        this.settings = $.extend({}, defaults, options);
//        this._defaults = defaults;
//        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            this.initPrefix();
            this.initInlineConstraints();
            this.initTextLabels();
            this.initEmptyForm();
            this.initFormsContainer();
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

        initTextLabels: function () {
            this.settings.addText = this.$element.find(".add-text").text();
            this.settings.deleteText = this.$element.find(".delete-text").text();
            this.settings.undeleteText = this.$element.find(".undelete-text").text();
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
            this.$element.parents("form").on("submit", function () {
                that.prepareForSubmit();
            });
        },
        replaceDeleteSectionToForm: function (formElement) {
            var that = this,
                button = $('<button type="button"></button>'),
                checkbox = $('<input type="checkbox">');

            button
                .text(this.settings.deleteText)
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
        },

        removeForm: function (formElement) {
            var that = this;

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

            this.decreaseFormCount();
            this.$element.trigger("formRemoved", formElement);
        },

        unRemoveForm: function (formElement) {
            if (!this.canAddAnotherForm()) {
                window.alert("U mag maximaal " + this.settings.maximumForms + " formulieren toevoegen. Verwijder eerst een ander formulier.");
                return;
            }
            var that = this;

            formElement.removeClass("removed");

            formElement
                .find(".delete input[type=checkbox]")
                .attr("checked", true);

            formElement
                .find(".delete button")
                .html("Delete")
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

            return form;
        },

        updateAddVisibility: function () {
            this.addButton
                .attr("disabled", !this.canAddAnotherForm())
                .toggleClass("disabled", this.canAddAnotherForm());
        },

        prepareForSubmit: function () {
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
        $(".inline-group").baseInlineFormset();
    });
})(django.jQuery, window);
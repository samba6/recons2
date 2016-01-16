from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

from adhocmodels.models import Currency


class FxDeal(models.Model):
    currency = models.ForeignKey(Currency, verbose_name='Currency')
    amount_allocated = models.DecimalField('Amount Allocated', max_digits=12, decimal_places=2)
    amount_utilized = models.DecimalField('Amount Utilized', max_digits=12, decimal_places=2, null=True, blank=True)
    allocated_on = models.DateField('Date Allocated')
    utilized_on = models.DateField('Date Utilized', null=True, blank=True)
    deal_number = models.CharField('Deal Number', max_length=50)
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    object_instance = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Time created')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Time updated')
    deleted_at = models.DateTimeField('Time deleted', null=True, blank=True)

    class Meta:
        db_table = 'fx_deal'
        app_label = 'core_recons'
        verbose_name = 'FX Deal'
        verbose_name_plural = 'FX Deal'

    def __unicode__(self):
        return '[{content_type} | deal={deal} | {ccy} | allocated={allocated:,.2f} | utilized={utilized:,.2f}]'.format(
                content_type=self.content_type,
                ccy=self.currency.code,
                allocated=self.amount_allocated,
                utilized=self.amount_utilized or 0,
                deal=self.deal_number
        )

    def save(self, *args, **kwargs):
        if ((self.amount_utilized and not self.utilized_on) or (not self.amount_utilized and self.utilized_on)):
            raise ValueError(
                    "Both amount utilized and date utilized must be specified together, but you only specified one")
        super(FxDeal, self).save(*args, **kwargs)

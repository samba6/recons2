# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('letter_of_credit', '0048_auto_20160801_1318'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='treasuryallocation',
            options={'ordering': ('-deal_date',), 'verbose_name': 'Treasury Allocation', 'verbose_name_plural': 'Treasury Allocation'},
        ),
    ]

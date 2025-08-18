from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('donors', '0008_userprofile_donated_recently_userprofile_not_ready'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='hospital',
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='request',
            name='cause',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='request',
            name='address',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='request',
            name='contact_info',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='request',
            name='city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='request',
            name='urgency',
            field=models.CharField(blank=True, choices=[('urgent', 'Urgent'), ('non_urgent', 'Non-Urgent')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='request',
            name='status',
            field=models.CharField(choices=[('open', 'Open'), ('accepted', 'Accepted'), ('collected', 'Collected')], default='open', max_length=20),
        ),
        migrations.AddField(
            model_name='request',
            name='accepted_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='accepted_requests', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=255)),
                ('read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='donors.request')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

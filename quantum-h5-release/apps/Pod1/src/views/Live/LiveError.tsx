import { defineComponent, computed } from 'vue';
import { QButton } from '@libs/p-comps/volt/QButton';
import { useLocale } from '@/hooks/i18n';
import { liveChannel } from '@/store/bar';

export const LiveErrorCamera = defineComponent({
    name: 'LiveErrorCamera',
    props: {
        errorMsg: String,
    },
    setup(props) {
        const handleCancel = () => {
            liveChannel.emit2('closeLiveErrorCamera')
        };
        const handleRetry = () => {
            liveChannel.emit2('retryLiveErrorCamera')
        };
        const { t } = useLocale();
        const errorMessage = computed(() => {
            const errorMessages: Record<string, string> = {
                'camera_occupied': t("live.error.camera_occupied"),
                'permission_denied': t("live.error.permission_denied"),
                'no_camera': t("live.error.no_camera"),
                'unknown_error': t("live.error.unknown_error"),
            };

            return errorMessages[props.errorMsg] || errorMessages['unknown_error'];
        });
        return () => {
            return <div
                style={{
                    display: 'flex',
                    padding: '8px 8px 8px 16px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: 'fit-content',
                }}
            >
                <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-on-surface)', lineHeight: '16px', maxWidth: '256px' }}>{errorMessage.value}</div>
                <QButton class="!w-[74px] !text-[12px]" color="primary" variant="outlined" style={{ marginLeft: '12px', padding: '8px 16px' }} onClick={handleCancel}>Cancel</QButton>
                <QButton class="!w-[90px] !text-[12px]" color='primary' style={{ marginLeft: '4px', marginRight: '0', padding: '8px 16px', whiteSpace: 'nowrap' }} onClick={handleRetry}>Try again</QButton>
            </div>
        }
    }
})
import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { StorageService } from '../../core/storage.service';
@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, ButtonsModule, LayoutModule],
  templateUrl: './scanner.html',
  styleUrls: ['./scanner.scss']
})
export class ScannerComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;

  private reader = new BrowserMultiFormatReader();
  private controls?: IScannerControls;

  highlight = false;
  scanning = false;
  lastCode?: string;
  error?: string;

   constructor(private store: StorageService) {}

  async ngOnInit() {
    await this.start();
  }

  private buildHints() {
    const hints = new Map();
    // Укажем ТОЧНО какие форматы ожидаем (добавь/убери под свои коды)
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.ITF
    ]);
    // Включим «усиленный» режим
    hints.set(DecodeHintType.TRY_HARDER, true);
    return hints;
  }

  private async pickRearCameraId(): Promise<string | undefined> {
    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
    if (!devices.length) return undefined;
    // Сначала ищем "back"/"rear" в названии
    const rear = devices.find(d =>
      /back|rear|environment/i.test(d.label || '')
    );
     console.log('Код устройства:', (rear ?? devices[0]).deviceId);
    return (rear ?? devices[0]).deviceId;
  }

  async start() {
    this.error = undefined;

    try {
      this.scanning = true;

      // Применим хинты
      this.reader = new BrowserMultiFormatReader(this.buildHints());

      const deviceId = await this.pickRearCameraId();

      // Зададим «хорошие» видео-констрейнты (задняя камера + высокое разрешение)
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      // Можно использовать decodeFromConstraints для точных настроек
      this.controls = await this.reader.decodeFromConstraints(
        { video: constraints.video as MediaTrackConstraints },
        this.videoRef.nativeElement,
        async (result, err) => {
          if (result) {
            const code = result.getText();
            if (code && code !== this.lastCode) {
              this.lastCode = code;
              navigator.vibrate?.(40);
                this.highlight = true;              // включаем подсветку
                setTimeout(() => this.highlight = false, 150); // выключаем через 150 мс
              console.log('Найден штрих-код:', code);
               await this.store.addScan(code);   // <-- сохраняем локально
              console.log('Сохранён код:', code);
            }
          }
          // Ошибки декодирования во время стрима — норм; не спамим консоль
        }
      );

    } catch (e: any) {
      this.error = e?.message ?? 'Ошибка доступа к камере';
      this.scanning = false;
    }
  }

  stop() {
    this.controls?.stop();
    this.scanning = false;
  }

  ngOnDestroy() {
    this.stop();
  }
}

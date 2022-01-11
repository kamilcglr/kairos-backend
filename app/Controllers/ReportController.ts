import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/app/Task'
import PDFDocument from 'pdfkit'
import User from 'App/Models/app/User'
import { DateTime, Duration } from 'luxon'
import Drive from '@ioc:Adonis/Core/Drive'
import { extname } from 'path'
import FrozenMonth from 'App/Models/app/FrozenMonth'

export default class ReportController {
  public async generatePDF(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        month: schema.date({ format: 'yyyy-MM' }),
      }),
    })

    try {
      // Verify if report is not already created
      await ctx.user.load('frozenMonths')
      if (
        ctx.user.frozenMonths.some((frozenMonth) => {
          return frozenMonth.month.startOf('month').equals(payload.month.startOf('month'))
        })
      ) {
        return ctx.response.forbidden({ message: `${payload.month} is already frozen` })
      }

      // get all tasks of user during the month
      const tasks = await Task.query()
        .where('start', '>', payload.month.startOf('month').toISO())
        .where('start', '<', payload.month.endOf('month').toISO())
        .preload('project')

      const pdf = new PdfCreator()
      const path = `${payload.month.toISODate()}-${ctx.user.full_name.replace(' ', '_')}.pdf`
      await pdf.createReport(path, {
        month: payload.month,
        user: ctx.user,
        tasks,
      })

      await ctx.user.related('frozenMonths').create({
        month: payload.month.startOf('month'),
        userId: ctx.user.id,
        path: path,
      })

      await ctx.user.load('frozenMonths')
      return ctx.response.created(ctx.user)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async getReports(ctx: HttpContextContract) {
    try {
      await ctx.user.load('frozenMonths')
      return ctx.response.created(ctx.user)
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async deleteReport(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        params: schema.object().members({
          report_id: schema.number([
            rules.exists({
              table: 'app.frozen_month',
              column: 'id',
              where: {
                user_id: ctx.request.param('user_id'),
              },
            }),
          ]),
        }),
      }),
    })
    try {
      const frozenMonth = await FrozenMonth.find(payload.params.report_id)
      if (!frozenMonth) return ctx.response.notFound({ message: 'Report not found' })

      await Drive.delete(frozenMonth.path)
      await frozenMonth.delete()

      return ctx.response.noContent()
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }

  public async getReport(ctx: HttpContextContract) {
    const payload = await ctx.request.validate({
      schema: schema.create({
        params: schema.object().members({
          report_id: schema.number([
            rules.exists({
              table: 'app.frozen_month',
              column: 'id',
              where: {
                user_id: ctx.request.param('user_id'),
              },
            }),
          ]),
        }),
      }),
    })

    try {
      const frozenMonth = await FrozenMonth.find(payload.params.report_id)
      if (!frozenMonth) return ctx.response.notFound({ message: 'Report not found' })

      const { size } = await Drive.getStats(frozenMonth.path)

      ctx.response.type(extname(frozenMonth.path))
      ctx.response.header('content-length', size)

      return ctx.response.stream(await Drive.getStream(frozenMonth.path))
    } catch (e) {
      ctx.logger.error(e)
      return ctx.response.internalServerError()
    }
  }
}

class PdfCreator {
  private doc: PDFDocument
  private readonly buffers: []

  constructor() {
    this.buffers = []
    this.doc = new PDFDocument({ size: 'A4', margin: 50 })
  }

  public async createReport(path, data: { month: DateTime; user: User; tasks: Task[] }) {
    new Promise((resolve, reject) => {
      try {
        this.generateHeader(data)
        this.generateUserInformation(data)
        this.generateTaskTable(data)
        this.generateFooter()

        this.doc.end()

        this.doc.on('data', this.buffers.push.bind(this.buffers))
        this.doc.on('end', async () => {
          const pdfData = Buffer.concat(this.buffers)
          await Drive.put(`${path}`, pdfData)
          resolve(pdfData)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  private generateHeader(data) {
    this.doc
      .image('public/images/kairos-logo.png', { width: 100 })
      .text('Report ' + data.user.full_name, { align: 'right' })
      .text('Generated ' + DateTime.now().toLocaleString(DateTime.DATE_SHORT), {
        align: 'right',
      })
      .moveDown()
  }

  private generateUserInformation(data) {
    this.doc.fillColor('#444444').fontSize(20).text('Report', 50, 160)

    this.generateHr(185)

    const customerInformationTop = 200
    this.doc
      .fontSize(10)
      .text('User:', 50, customerInformationTop)
      .font('Helvetica-Bold')
      .text(data.user.full_name, 150, customerInformationTop)
      .font('Helvetica')
      .text('Report date:', 50, customerInformationTop + 15)
      .text(
        data.month.toLocaleString({ year: 'numeric', month: 'long' }),
        150,
        customerInformationTop + 15
      )
      .text('Task count:', 50, customerInformationTop + 30)
      .text(data.tasks.length, 150, customerInformationTop + 30)

      .font('Helvetica')
      .text('Manager:', 300, customerInformationTop)
      .font('Helvetica-Bold')
      .text(data.user.manager.full_name, 350, customerInformationTop)
      .moveDown()

    this.generateHr(252)
  }

  private generateTaskTable(data) {
    const invoiceTableTop = 330
    let i
    let yPosition = 0
    let rowHeight = 50

    yPosition += invoiceTableTop
    this.doc.font('Helvetica-Bold')
    this.generateTableRow(yPosition, 'Task', 'Project', 'Time', 'Duration')

    yPosition += 20
    this.generateHr(yPosition)
    this.doc.font('Helvetica')
    yPosition += 20

    let totalDuration = Duration.fromObject({ hours: 0, minutes: 0 })
    for (i = 0; i < data.tasks.length; i++) {
      const task = data.tasks[i]
      const duration = Duration.fromObject(
        task.end.diff(task.start, ['hours', 'minutes']).toObject()
      )
      totalDuration = totalDuration.plus(duration)

      if (yPosition > 842 - 50) {
        this.doc.addPage({
          size: 'A4',
          margin: 50,
        })
        yPosition = 30
      }

      this.generateTableRow(
        yPosition - 10,
        task.name,
        task.project.name,
        PdfCreator.getTime(task.start, task.end),
        duration.toFormat('hh:mm')
      )
      this.generateHr(yPosition + 20)
      yPosition += rowHeight
    }

    this.generateTableRow(
      yPosition,
      'Total duration',
      '',
      '',
      totalDuration.toFormat('hh:mm'),
      true
    )
    this.doc.moveDown()
  }

  private generateFooter() {
    this.doc
      .fontSize(10)
      .text('This month is now locked. Thank you for your work.', 50, this.doc.y, {
        align: 'center',
      })
  }

  private generateTableRow(
    y,
    task: string,
    project: string,
    time: string,
    duration: string,
    bold: boolean = false
  ) {
    if (bold) this.doc.font('Helvetica-Bold')
    this.doc
      .fontSize(10)
      .text(task, 50, y, { width: 150, align: 'left' })
      .text(project, 200, y, { width: 100, align: 'left' })
      .text(time, 300, y, { width: 150, align: 'left' })
      .text(duration, 450, y, { width: 100, align: 'right' })
    if (bold) this.doc.font('Helvetica')
  }

  private generateHr(y) {
    this.doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke()
  }

  private static getTime(from: DateTime, end: DateTime): string {
    return `From ${from.toLocaleString(DateTime.DATETIME_SHORT)}
To ${end.toLocaleString(DateTime.DATETIME_SHORT)}`
  }
}

// COLOR #031284
